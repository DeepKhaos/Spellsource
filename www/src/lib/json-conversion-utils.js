import Blockly, {isNumber} from "blockly";
import BlocklyMiscUtils from "./blockly-misc-utils";

export default class JsonConversionUtils {
  static classBlocksDictionary = {}
  static enumBlocksDictionary = {}
  static allArgNames = new Set()
  static blockTypeColors = {
    IntAttribute: 210,
    BoolAttribute: 190
  }

  static addBlockToMap(block) {
    if (block.type.endsWith('SHADOW')) {
      return
    }
    let list = this.argsList(block)
    if (list.length > 0) {
      let className = null

      for (let arg of list) {
        this.allArgNames.add(arg.name)
        if (arg.name.endsWith('class')) {
          className = arg.value
          break
        }
      }
      if (!!className) {
        if (!this.classBlocksDictionary[className]) {
          this.classBlocksDictionary[className] = []
        }
        this.classBlocksDictionary[className].push(block)
      }
    } else {
      if (!this.enumBlocksDictionary[block.data]) {
        this.enumBlocksDictionary[block.data] = []
      }
      this.enumBlocksDictionary[block.data].push(block)
    }

  }


  static newBlock(workspace, type) {
    let block = workspace.newBlock(type)
    BlocklyMiscUtils.manuallyAddShadowBlocks(block, Blockly.Blocks[type].json)
    return block
  }

  static generateCard(workspace, card) {
    let block = this.newBlock(workspace, 'Starter_' + card.type)
    let args = ['baseManaCost', 'name', 'baseAttack', 'baseHp', 'description']
    args.forEach(arg => {
      if (!!card[arg] && !!block.getField(arg)) {
        block.getField(arg).setValue(card[arg])
      }
    })
    block.initSvg()

    if (!!block.getInput('name')) {
      block.getInput('name').connection.targetBlock().setFieldValue(card.name, 'name')
    }
    if (!!block.getInput('description')) {
      block.getInput('description').connection.targetBlock().setFieldValue(card.description, 'description')
    }

    let lowestBlock = block

    if (!!card.heroClass) {
      let heroClassBlock = workspace.newBlock('HeroClass_' + card.heroClass)
      block.getInput('heroClass').connection.connect(heroClassBlock.outputConnection)
      heroClassBlock.initSvg()
    }

    if (!!card.rarity) {
      let rarityBlock = workspace.newBlock('Rarity_' + card.rarity)
      block.getInput('rarity').connection.connect(rarityBlock.outputConnection)
      rarityBlock.initSvg()
    }

    if (!!card.spell) {
      this.handleArg(block.getInput('targetSelection').connection, card.targetSelection, 'targetSelection', workspace, card)
      this.handleArg(block.getInput('spell').connection, card.spell, 'spell', workspace, card)
    }

    if (!!card.battlecry) {
      let openerBlock = null
      if (!!card.battlecry.condition) {
        openerBlock = this.newBlock(workspace, 'Property_opener2')
      } else {
        openerBlock = this.newBlock(workspace, 'Property_opener1')
      }
      lowestBlock.nextConnection.connect(openerBlock.previousConnection)
      openerBlock.initSvg()

      this.handleArg(openerBlock.getInput('battlecry.targetSelection').connection, card.battlecry.targetSelection, 'battlecry.targetSelection', workspace, card.battlecry)
      this.handleArg(openerBlock.getInput('battlecry.spell').connection, card.battlecry.spell, 'battlecry.spell', workspace, card.battlecry)

      if (!!card.battlecry.condition) {
        this.handleArg(openerBlock.getInput('battlecry.condition').connection, card.battlecry.condition, 'battlecry.condition', workspace, card.battlecry)
      }
      lowestBlock = openerBlock
    }

    if (!!card.deathrattle) {
      let aftermathBlock = this.newBlock(workspace, 'Property_aftermath')
      lowestBlock.nextConnection.connect(aftermathBlock.previousConnection)
      aftermathBlock.initSvg()
      this.handleArg(aftermathBlock.getInput('deathrattle').connection, card.deathrattle, 'deathrattle', workspace, card)
      lowestBlock = aftermathBlock
    }

    if (!!card.triggers || !!card.trigger) {
      let triggersBlock = this.newBlock(workspace, 'Property_triggers')
      lowestBlock.nextConnection.connect(triggersBlock.previousConnection)
      triggersBlock.initSvg()

      let triggers
      if (!!card.trigger) {
        triggers = [card.trigger]
      } else {
        triggers = card.triggers
      }
      let lowestConnection = triggersBlock.getFirstStatementConnection()
      for (let trigger of triggers) {
        let triggerBlock = this.enchantment(trigger, workspace)
        lowestConnection.connect(triggerBlock.previousConnection)
        lowestConnection = triggerBlock.nextConnection
        triggerBlock.initSvg()
      }

      lowestBlock = triggersBlock
    }

    if (!!card.auras || !!card.aura) {
      let aurasBlock = this.newBlock(workspace, 'Property_auras')
      lowestBlock.nextConnection.connect(aurasBlock.previousConnection)
      aurasBlock.initSvg()
      this.auras(aurasBlock, card, workspace)
      lowestBlock = aurasBlock
    }

    if (!!card.attributes) {
      if (!!card.attributes.BATTLECRY) {
        delete card.attributes.BATTLECRY
      }
      if (!!card.attributes.DEATHRATTLES) {
        delete card.attributes.DEATHRATTLES
      }
      if (Object.values(card.attributes).length > 0) {
        let attributesBlock = this.newBlock(workspace, 'Property_attributes')
        lowestBlock.nextConnection.connect(attributesBlock.previousConnection)
        attributesBlock.initSvg()
        let lowestConnection = attributesBlock.getFirstStatementConnection()
        for (let atr in card.attributes) {
          let attributeBlock
          if (isNumber(card.attributes[atr])) {
            attributeBlock = this.newBlock(workspace, 'Property_attributes_int')
            attributeBlock.getField('value').setValue(card.attributes[atr])
          } else {
            attributeBlock = this.newBlock(workspace, 'Property_attributes_boolean')
          }
          this.handleArg(attributeBlock.getInput('attribute').connection, atr, 'attribute', workspace, card.attributes)
          attributeBlock.initSvg()
          lowestConnection.connect(attributeBlock.previousConnection)
          lowestConnection = attributeBlock.nextConnection
        }

        lowestBlock = attributesBlock
      }
    }

    if (!!card.manaCostModifier) {
      let costyBlock = null
      if (card.manaCostModifier.class === 'ConditionalValueProvider' && card.manaCostModifier.ifFalse === 0) {
        costyBlock = this.newBlock(workspace, 'Property_cost_modifier_conditional')
        this.handleArg(costyBlock.getInput('manaCostModifier.condition').connection, card.manaCostModifier.condition,
          'condition', workspace, card)
        if (typeof card.manaCostModifier.ifTrue === 'object') {
          this.handleArg(costyBlock.getInput('manaCostModifier.ifTrue').connection, card.manaCostModifier.ifTrue,
            'ifTrue', workspace, card)
        } else {
          this.handleIntArg(costyBlock, costyBlock.json.args0[0], workspace, card.manaCostModifier.ifTrue)
        }

      } else {
        costyBlock = this.newBlock(workspace, 'Property_cost_modifier')
        this.handleArg(costyBlock.getInput('manaCostModifier').connection, card.manaCostModifier,
          'manaCostModifier', workspace, card)
      }
      lowestBlock.nextConnection.connect(costyBlock.previousConnection)
      costyBlock.initSvg()
      lowestBlock = costyBlock
    }

    workspace.render()

    return block
  }

  //handles finding an input on a block by what its name ends with
  static getInputEndsWith(block, inputName) {
    for (let name of this.allArgNames) {
      let input = block.getInput(name)
      if (!!input) {
        if (name.endsWith(inputName)) {
          return input
        }
      }
    }
    return null
  }

  static enchantmentNeedsOptions(trigger, props) {
    return !(props.length === 2 && !!trigger.eventTrigger && !!trigger.spell)
  }

  static enchantment(trigger, workspace, triggerBlock = null) {
    let props = this.relevantProperties(trigger);
    if (!this.enchantmentNeedsOptions(trigger, props)) {
      if (!triggerBlock) {
        triggerBlock = this.newBlock(workspace, 'Enchantment')
      }
    } else {
      if (!triggerBlock) {
        triggerBlock = this.newBlock(workspace, 'EnchantmentOptions')
      }
      let lowestOptionConnection = triggerBlock.getFirstStatementConnection()
      for (let prop of props) {
        if (prop === 'spell' || prop === 'eventTrigger') {
          continue
        }
        let match = null
        for (let blockType in Blockly.Blocks) {
          let block = Blockly.Blocks[blockType].json
          if (block.type.startsWith('EnchantmentOption')) {
            for (let arg of this.argsList(block)) {
              if (arg.name === prop) {
                match = block
              }
            }
          }
        }
        let option = this.newBlock(workspace, match.type)
        if (trigger[prop] !== true) {
          option.setFieldValue(trigger[prop], prop)
        }
        option.initSvg()
        lowestOptionConnection.connect(option.previousConnection)
        lowestOptionConnection = lowestOptionConnection.targetBlock().nextConnection
      }
    }
    this.handleArg(triggerBlock.getInput('spell').connection, trigger.spell, 'spell', workspace, trigger)
    this.handleArg(triggerBlock.getInput('eventTrigger').connection, trigger.eventTrigger, 'eventTrigger', workspace, trigger)

    return triggerBlock
  }

  //handles the auras on a card
  static auras(block, json, workspace) {
    let auras
    if (!!json.aura) {
      auras = [json.aura]
    } else {
      auras = json['auras']
    }
    let lowestConnection = block.getFirstStatementConnection()
    for (let aura of auras) {
      this.handleArg(lowestConnection, aura, 'aura', workspace, auras, true)
      lowestConnection = lowestConnection.targetBlock().nextConnection
    }
  }

  //finds the best block match for a given bit of json
  static getMatch(json, inputName, parentJson) {
    let matches = null
    let bestMatch = null
    if (typeof json !== 'object') { //just looking for the correct block with the data of the json string
      let lookingForType = BlocklyMiscUtils.inputNameToBlockType(inputName)
      if (inputName === 'attribute') {
        json = json.toString().replace('AURA_', '')
      }
      matches = this.enumBlocksDictionary[json]
      if (!matches || matches.length === 0) {
        return
      }
      for (let match of matches) {
        if (!lookingForType || match.type.startsWith(lookingForType)
          || match.type.startsWith('CatalogueCard')) {
          return match
        }
      }
    } else if (!!json.class) { //need to find the block that represents that class
      let className = json.class
      if (className === 'AddEnchantmentSpell' && !!json.trigger) {
        if (this.enchantmentNeedsOptions(json.trigger, this.relevantProperties(json.trigger))) {
          return Blockly.Blocks['Spell_AddEnchantment2'].json
        } else {
          return Blockly.Blocks['Spell_AddEnchantment'].json
        }
      }
      matches = this.classBlocksDictionary[className]
      if (!matches || matches.length === 0) {
        return
      }
      let relevantProperties = this.relevantProperties(json)
      let goodMatches = []
      for (let match of matches) { //for each possible match
        let reallyHasIt = true
        for (let property of relevantProperties) { //check the json's relevant properties
          if ((relevantProperties.includes('target') || match.output === 'SpellDesc') && property === 'filter') {
            continue
          }
          if ((className.endsWith('Spell') || json.targetPlayer === 'SELF') && property === 'targetPlayer') {
            continue
          }
          let hasIt = false
          for (let arg of this.argsList(match)) { //see if the match has a corresponding prop
            if (arg.name.split('.')[0] === property) {
              if (arg.type === 'field_label_serializable_hidden') {
                if ((arg.value === 'TRUE' ? true : arg.value) === json[property]) {
                  hasIt = true
                }
              } else {
                hasIt = true
              }
            }

          }
          if (!hasIt) { //if it doesn't, it's not good enough
            reallyHasIt = false
            break
          }
        }
        if (reallyHasIt) { //if it covers all the json's properties, it's good enough
          goodMatches.push(match)
        }
      }
      let fewest = null
      for (let goodMatch of goodMatches) { //choose the one with the fewest extra properties
        let argsList = this.argsList(goodMatch);
        let score = 0
        for (let property in json) { //see how many extra properties the json has that the potential match doesn't
          if (json[property] === null || json[property] === undefined) {
            continue
          }
          let delta = 1
          for (let arg of argsList) {
            if (arg.name.split('.').slice(-1)[0] === property) {
              if (arg.type === 'field_label_serializable_hidden') {
                if ((arg.value === 'TRUE' ? true : arg.value) === json[property]) {
                  delta = 0
                }
              } else {
                delta = 0
              }
              break
            }
          }
          score += delta
        }
        for (let arg of argsList) { //see how many extra properties the potential match has that the json doesn't
          let delta = 1
          for (let property in json) {
            if (json[property] === null || json[property] === undefined) {
              continue
            }
            if (arg.name.split('.').slice(-1)[0] === property) {
              if (arg.type === 'field_label_serializable_hidden') {
                if ((arg.value === 'TRUE' ? true : arg.value) === json[property]) {
                  delta = 0
                }
              } else {
                delta = 0
              }
              break
            }
          }
          score += delta
        }
        if (fewest === null || score < fewest
          || (score <= fewest && bestMatch.type.localeCompare(goodMatch.type) > 0)) {
          bestMatch = goodMatch
          fewest = score
        }
      }
    }
    return bestMatch
  }

  /**
   * a scoring system for the potential matches between a block and json, potentially
   *
   * factors:
   *  -block needs to be able to fully represent the json
   *  -inputs should be weighted better than fields
   *  -
   */
  static scoreMatch() {

  }

  //handles an argument on a block, recursively constructing the relevant blocks based on the json
  static handleArg(connection, json, inputName, workspace, parentJson, statement = false) {
    json = this.mutateJson(json)

    let bestMatch = this.getMatch(json, inputName, parentJson)
    let newBlock
    if (!bestMatch) {
      //bestMatch = this.generateDummyBlock(json, inputName, parentJson)
      this.generateDummyBlock(json, inputName, parentJson)
      newBlock = this.handleNoMatch(json, inputName, parentJson, workspace)
    } else {
      newBlock = this.newBlock(workspace, bestMatch.type)
    }

    if (json.hasOwnProperty('targetPlayer') && !!bestMatch && bestMatch.output !== 'Trigger') {
      let realBlock
      switch (bestMatch.output) {
        case 'ValueProviderDesc':
          realBlock = this.newBlock(workspace, 'ValueProvider_TargetPlayer')
          break
        default:
          realBlock = this.newBlock(workspace, 'Spell_TargetPlayer')
          break
      }
      realBlock.getInput('super').connection.connect(newBlock.outputConnection)
      this.handleArg(realBlock.getInput('targetPlayer').connection, json.targetPlayer, 'targetPlayer', workspace, json)
      connection.connect(realBlock.outputConnection)
      realBlock.initSvg()
    } else if (inputName === 'target' && !!parentJson.target && !!parentJson.filter
      && !this.getInputEndsWith(connection.getSourceBlock(), 'filter')) {
      let filterBlock = this.newBlock(workspace, 'EntityReference_FILTER')
      filterBlock.getInput('super').connection.connect(newBlock.outputConnection)
      this.handleArg(filterBlock.getInput('super.filter').connection, parentJson.filter, 'filter', workspace, json)
      connection.connect(filterBlock.outputConnection)
      filterBlock.initSvg()
    } else if (!!json.invert && !this.argsList(bestMatch).map(arg => arg.name.split('.').slice(-1)[0]).includes('invert')) {
      let invertBlock
      if (json.class.endsWith('Filter')) {
        invertBlock = this.newBlock(workspace, 'Filter_NOT')
      } else if (json.class.endsWith('Condition')) {
        invertBlock = this.newBlock(workspace, 'Condition_NOT')
      }
      invertBlock.getInput('super').connection.connect(newBlock.outputConnection)
      connection.connect(invertBlock.outputConnection)
      invertBlock.initSvg()
    } else if (inputName.endsWith('Trigger') && !!json.class && json.class.endsWith('Trigger')) {
      let outerMostBlock = newBlock
      if (!!json.fireCondition) {
        let addedBlock = this.newBlock(workspace, 'Trigger_FireCondition')
        this.handleArg(addedBlock.getInput('fireCondition').connection, json.fireCondition, 'fireCondition', workspace, json)
        addedBlock.initSvg()
        addedBlock.getInput('super').connection.connect(outerMostBlock.outputConnection)
        outerMostBlock = addedBlock
      }
      if (!!json.queueCondition) {
        let addedBlock = this.newBlock(workspace, 'Trigger_QueueCondition')
        this.handleArg(addedBlock.getInput('queueCondition').connection, json.queueCondition, 'queueCondition', workspace, json)
        addedBlock.initSvg()
        addedBlock.getInput('super').connection.connect(outerMostBlock.outputConnection)
        outerMostBlock = addedBlock
      }
      if (!!json.race) {
        let addedBlock = this.newBlock(workspace, 'Trigger_Race')
        this.handleArg(addedBlock.getInput('race').connection, json.race, 'race', workspace, json)
        addedBlock.initSvg()
        addedBlock.getInput('super').connection.connect(outerMostBlock.outputConnection)
        outerMostBlock = addedBlock
      }
      if (!!json.requiredAttribute) {

      }

      connection.connect(outerMostBlock.outputConnection)
    } else if (inputName.endsWith('targetSelection') && !!parentJson.spell && !!parentJson.spell.filter) {
      let outerBlock
      if (parentJson.spell.filter.class === 'RaceFilter') {
        outerBlock = this.newBlock(workspace, 'TargetSelection_RACE')
        this.handleArg(outerBlock.getInput('super.spell.filter.race').connection, parentJson.spell.filter.race, 'race', workspace, parentJson.spell.filter)
      } else {
        outerBlock = this.newBlock(workspace, 'TargetSelection_FILTER')
        this.handleArg(outerBlock.getInput('super.spell.filter').connection, parentJson.spell.filter, 'filter', workspace, parentJson.spell)
      }
      outerBlock.getInput('super').connection.connect(newBlock.outputConnection)
      outerBlock.initSvg()
      connection.connect(outerBlock.outputConnection)
    } else {
      if (statement) {
        connection.connect(newBlock.previousConnection)
      } else {
        connection.connect(newBlock.outputConnection)
      }
    }
    newBlock.initSvg()

    if (!bestMatch) {
      return
    }

    //now handle each dropdown on the new block (assumes stuff will just work)
    for (let dropdown of this.dropdownsList(bestMatch)) {
      let jsonElement = json[dropdown.name]
      if (!jsonElement && (dropdown.name.includes('.') || dropdown.name.includes('super') || dropdown.name.includes(','))) {
        jsonElement = this.tryToFindCorrectElement(dropdown.name, json, parentJson)
      }

      if (!jsonElement) {
        continue
      }

      newBlock.setFieldValue(jsonElement, dropdown.name)
    }

    //now handle each input on the new block
    for (let inputArg of this.inputsList(bestMatch)) {
      let name = inputArg.name;
      let jsonElement = json[name];
      if (!jsonElement && (name.includes('.') || name.includes('super') || name.includes(','))) {
        jsonElement = this.tryToFindCorrectElement(name, json, parentJson)
        name = name.split('.').slice(-1)[0]
      }

      if (jsonElement === null || jsonElement === undefined) {
        continue
      }

      if (name === 'target' && json.randomTarget != null) { //handles the randomTarget arg
        let randomBlock = this.newBlock(workspace, 'EntityReference_RANDOM')
        this.handleArg(randomBlock.getInput('super').connection, jsonElement, name, workspace, json)
        newBlock.getInput(name).connection.connect(randomBlock.outputConnection)
        randomBlock.initSvg()
      } else { //if the json has a corresponding argument
        if (typeof jsonElement !== 'object' && (name.startsWith('value') || name.endsWith('Bonus')
          || name === 'howMany' || name.startsWith('if')
        )) { //integer block stuff
          this.handleIntArg(newBlock, inputArg, workspace, jsonElement)
        } else if (name === 'spells' || name === 'conditions'
          || name === 'filters' || name === 'cards') { //arrays of things stuff
          let thingArray = jsonElement
          let lowestBlock = newBlock.getFirstStatementConnection().targetBlock()
          this.handleArg(lowestBlock.getInput('i').connection, thingArray[0], name.slice(0, -1), workspace, thingArray)
          for (let i = 1; i < thingArray.length; i++) {
            let thingI
            switch (name) {
              case 'conditions':
                thingI = this.newBlock(workspace, 'Condition_I')
                break
              case 'filters':
                thingI = this.newBlock(workspace, 'Filter_I')
                break
              case 'cards':
                thingI = this.newBlock(workspace, 'Spell_Card')
                break
              default:
                thingI = this.newBlock(workspace, 'Spell_Meta')
                break
            }
            this.handleArg(thingI.getInput('i').connection, thingArray[i], name.slice(0, -1), workspace, thingArray)
            lowestBlock.nextConnection.connect(thingI.previousConnection)
            thingI.initSvg()
            lowestBlock = thingI
          }

        } else if (name === 'trigger') {
          this.enchantment(json.trigger, workspace, newBlock.getFirstStatementConnection().targetBlock())
        } else { //default recursion case
          this.handleArg(newBlock.getInput(name).connection, jsonElement, name, workspace, json)
        }
      }
    }
  }

  static tryToFindCorrectElement(name, json, parentJson) {
    if (!name) {
      return
    }
    if (name.includes(',')) {
      let names = name.split(',')
      const recurr = (names, i, json, parentJson) => {
        return this.tryToFindCorrectElement(names[i]) || recurr(names, i + 1, json, parentJson)
      }
      return recurr(names, 0, json, parentJson)
    } else {
      let i = name.indexOf('.')
      if (i <= 0) {
        return json[name]
      }
      let start = name.substring(0, i)
      let rest = name.substring(i + 1)
      if (start === 'super' && !!parentJson) {
        return this.tryToFindCorrectElement(rest, parentJson, null)
      } else if (!!json[start]){
        return this.tryToFindCorrectElement(rest, json[start], json)
      }
    }
  }

  static handleIntArg(newBlock, inputArg, workspace, int) {
    let valueBlock
    if (!!newBlock.getInput(inputArg.name).connection.targetBlock()
      && newBlock.getInput(inputArg.name).connection.targetBlock().type === 'ValueProvider_int') {
      valueBlock = newBlock.getInput(inputArg.name).connection.targetBlock()
    } else {
      valueBlock = this.newBlock(workspace, 'ValueProvider_int')
      newBlock.getInput(inputArg.name).connection.connect(valueBlock.outputConnection)
      valueBlock.initSvg()
    }
    valueBlock.setFieldValue(int, 'int')
  }

  static generateDummyBlock(json, inputName, parentJson) {
    inputName = inputName.split('.').slice(-1)[0]
    let type = BlocklyMiscUtils.inputNameToBlockType(inputName)
    let consoleBlock
    if (typeof json !== 'object') {
      if (type === 'Attribute') {
        if (!!parentJson.value || (!!parentJson.class && parentJson.class.endsWith('ValueProvider'))) {
          type = 'IntAttribute'
        } else {
          type = 'BoolAttribute'
        }
      }
      consoleBlock = {
        type: type + '_' + json.toString(),
        data: json.toString(),
        colour: this.blockTypeColors[type],
        output: type,
        message0: BlocklyMiscUtils.toHappyFormatting(json.toString())
      }
    } else {
      let props = this.relevantProperties(json);
      let className = json.class
      let messages = []
      let args = []
      for (let prop of props) {
        let shouldBeField = !BlocklyMiscUtils.inputNameToBlockType(prop)
        if (!!json.class && json.class.endsWith('Trigger') &&
          (prop === 'targetPlayer' || prop === 'sourcePlayer')) {
          shouldBeField = true
        }
        let arg = {
          name: prop
        }
        let newMessage = prop + ': %1'
        if (shouldBeField) {
          if (prop === 'operation') {
            if (this.dropdownsList(Blockly.Blocks['ValueProvider_Algebraic'].json)[0]
              .options.map(arr => arr[1]).includes(json[prop])) {
              arg = this.dropdownsList(Blockly.Blocks['ValueProvider_Algebraic'].json)[0]
            } else {
              arg = this.dropdownsList(Blockly.Blocks['Condition_Comparison'].json)[0]
            }
          } else {
            arg.type = 'field_label_serializable_hidden'
            arg.value = json[prop]
            newMessage += '"' + BlocklyMiscUtils.toHappyFormatting(json[prop].toString()) + '"'
          }
        } else {
          arg.type = 'input_value'
          arg.check = (prop === 'attribute' ? (!!parentJson.value ? 'Int' : 'Bool') : '')
            + BlocklyMiscUtils.blockTypeToOuput(BlocklyMiscUtils.inputNameToBlockType(prop))
          arg.shadow = {
            type: prop === 'target' ? 'EntityReference_IT' :
              BlocklyMiscUtils.inputNameToBlockType(prop) +
              (prop === 'attribute' ? (!!parentJson.value ? '_INT_SHADOW' : '_BOOL_SHADOW')
              : '_SHADOW')
          }
        }
        messages.push(newMessage)
        args.push(arg)
      }

      consoleBlock = {
        type: type + '_Custom' + className.replace(type, ''),
        inputsInline: false,
        output: BlocklyMiscUtils.blockTypeToOuput(type),
        colour: this.blockTypeColors[type],
        message0: className + '%1',
        args0: [{
          type: 'field_label_serializable_hidden',
          name: 'class',
          value: className
        }]
      }
      if (type === 'Aura') {
        delete consoleBlock.output
        consoleBlock.previousStatement = 'Auras'
        consoleBlock.nextStatement = 'Auras'
      }
      for (let j = 1; j <= messages.length; j++) {
        //block['message' + j.toString()] = messages[j - 1]
        //block['args' + j.toString()] = [args[j - 1]]


        consoleBlock.message0 += ' ' + messages[j-1].replace('%1', '%'+(j+1).toString())
        consoleBlock.args0.push(args[j-1])
      }

    }

    console.log('Had to create new block ' + consoleBlock.type)
    console.log(JSON.stringify(consoleBlock, null, 2).toString()
      .replace('"colour": "(\\d+)"', '"colour": $1'))
    return consoleBlock
  }

  static handleNoMatch(json, inputName, parentJson, workspace) {
    inputName = inputName.split('.').slice(-1)[0]
    let type = BlocklyMiscUtils.inputNameToBlockType(inputName)
    if (!type && !!json.class) {
      type = BlocklyMiscUtils.inputNameToBlockType(json.class.split(/(?=[A-Z])/).slice(-1)[0].toLowerCase())
    }
    let newBlock = this.newBlock(workspace, 'Custom'+type)
    if (typeof json !== 'object') {
      newBlock.setFieldValue(json, 'value')
    } else if (!!json.class) {
      newBlock.getInput('class').connection.targetBlock().setFieldValue(json.class, 'class')
      let lowestConnection = newBlock.getFirstStatementConnection()

      for (let arg in json) {
        if (arg === 'class') {
          continue
        }

        let blockType = BlocklyMiscUtils.inputNameToBlockType(arg);
        if (!blockType) {
          blockType = 'text'
        }
        let newArgBlock = this.newBlock(workspace, 'CustomArg_' + blockType)
        newArgBlock.previousConnection.connect(lowestConnection)
        lowestConnection = newArgBlock.nextConnection
        newArgBlock.initSvg()
        newArgBlock.setFieldValue(arg, 'customArg')

        if (!!newArgBlock.getInput('customValue')) {
          this.handleArg(newArgBlock.getInput('customValue').connection, json[arg], arg,
            workspace, parentJson)
        } else {
          newArgBlock.setFieldValue(json[arg],'customValue')
        }
      }
    }
    return newBlock
  }

  //the arguments of a desc that should be used in deciding on a block representation
  static relevantProperties(json) {
    let relevantProperties = []
    for (let property in json) {
      if ((property === 'randomTarget' && !!json.target) || property === 'class'
        || property === 'fireCondition' || property === 'queueCondition'
        || property === 'invert') {
        continue
      }
      if (!!json[property]) {
        relevantProperties.push(property)
      }
    }
    return relevantProperties
  }

  //deals with places in the json that could be equivalent in function to different json,
  //but need special handling to be creatable in the card editor
  static mutateJson(json) {
    if ((json === null || json === undefined)) {
      json = 'NONE'
    }
    if (typeof json !== 'object') {
      return json
    }
    let className = json.class
    let props = this.relevantProperties(json);

    //the 'has operation can be implied in many cases
    if (className.endsWith('Filter') || className.endsWith('Condition')) {
      if (props.includes('attribute') && props.includes('operation')
        && !props.includes('value') && json.operation === 'HAS') {
        delete json.operation
        props = this.relevantProperties(json);
      }
    }

    if (className === 'CardFilter') {
      if (props.length === 1) { //cardfilters for just a race can be race filters
        if (props[0] === 'race') {
          return {
            class: 'RaceFilter',
            race: json.race,
            invert: json.invert
          }
        }
        if (props[0] === 'attribute') {
          return {
            class: 'AttributeFilter',
            attribute: json.attribute,
            invert: json.invert
          }
        }
      } else if (!(props.length === 2 && props.includes('attribute') && (props.includes('value') || props.includes('operation')))
        && !(props.length === 3 && props.includes('attribute') && props.includes('operation') && props.includes('value'))
      ) { //cardfilters with many different properties need to be split up to a big and filter
        let filters = []
        if (!!json.race) {
          filters.push({
            class: 'RaceFilter',
            race: json.race
          })
        }
        if (!!json.cardType) {
          filters.push({
            class: 'CardFilter',
            cardType: json.cardType
          })
        }
        if (!!json.attribute) {
          if (!json.value && (!json.operation || json.operation === 'HAS') && !!this.enumBlocksDictionary[json.attribute]) {
            if ((this.enumBlocksDictionary[json.attribute].output === 'BoolAttribute')) {
              filters.push({
                class: 'AttributeFilter',
                attribute: json.attribute
              })
            } else {
              filters.push({
                class: 'AttributeFilter',
                attribute: json.attribute,
                operation: 'GREATER_OR_EQUAL',
                value: 1
              })
            }
          } else {
            filters.push({
              class: 'AttributeFilter',
              attribute: json.attribute,
              operation: json.operation,
              value: json.value
            })
          }
        }
        if (!!json.manaCost) {
          filters.push({
            class: 'CardFilter',
            manaCost: json.manaCost
          })
        }
        return {
          class: 'AndFilter',
          filters: filters,
          invert: json.invert
        }
      }
    }

    //functionality is the same
    if (className === 'FromDeckToHandSpell') {
      json.class = 'DrawCardSpell'
    }

    //would be redundant to add this functionality separately
    if (className === 'MinionCountCondition') {
      json = {
        class: 'ComparisonCondition',
        value1: {
          class: 'EntityCountValueProvider',
          target: json.targetPlayer === 'OPPONENT' ? 'ENEMY_MINIONS'
            : json.targetPlayer === 'BOTH' ? 'ALL_MINIONS'
              : 'FRIENDLY_MINIONS'
        },
        operation: json.operation,
        value2: json.value
      }
    }
    if (className === 'CardCountCondition') {
      json = {
        class: 'ComparisonCondition',
        value1: {
          class: 'CardCountValueProvider',
          targetPlayer: json.targetPlayer,
          cardFilter: !!json.filter ? json.filter : json.cardFilter
        },
        operation: json.operation,
        value2: json.value
      }
    }

    //some auras specify extra triggers unnecessarily
    if (className.endsWith('Aura') && !!json.triggers) {
      let triggersDontMatter = true
      for (let trigger of json.triggers) {
        if (trigger.class !== 'WillEndSequenceTrigger') {
          triggersDontMatter = false
        }
      }
      if (triggersDontMatter) {
        delete json.triggers
      }
    }

    //in spells, the targetPlayer of self is always redundant
    if (json.targetPlayer === 'SELF' && json.class.endsWith('Spell')) {
      delete json.targetPlayer
    }

    //for certain triggers the Source Player and Target Player are just the same
    if ((className === 'MinionSummonedTrigger' || className === 'MinionPlayedTrigger')
      && !!json.sourcePlayer) {
      json.targetPlayer = json.sourcePlayer
      delete json.sourcePlayer
    }

    if (className === 'TemporaryAttackSpell' && !!json.attackBonus) {
      if (!json.value) {
        json.value = 0
      }
      json.value += json.attackBonus
      delete json.attackBonus
    }


    return json
  }


  static inputsList(block) {
    let inputsList = []
    for (let i = 0; i < 10; i++) {
      if (!!block['args' + i.toString()]) {
        for (let j = 0; j < 10; j++) {
          const arg = block['args' + i.toString()][j]
          if (!!arg && arg.type.includes('input')) {
            inputsList.push(arg)
          }
        }
      }
    }
    return inputsList
  }

  static dropdownsList(block) {
    let inputsList = []
    for (let i = 0; i < 10; i++) {
      if (!!block['args' + i.toString()]) {
        for (let j = 0; j < 10; j++) {
          const arg = block['args' + i.toString()][j]
          if (!!arg && arg.type.includes('dropdown')) {
            inputsList.push(arg)
          }
        }
      }
    }
    return inputsList
  }

  static argsList(block) {
    let argsList = []
    for (let i = 0; i < 10; i++) {
      if (!!block['args' + i.toString()]) {
        for (let j = 0; j < 10; j++) {
          const arg = block['args' + i.toString()][j]
          if (!!arg) {
            argsList.push(arg)
          }
        }
      }
    }
    return argsList
  }
}