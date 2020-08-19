import Blockly from 'blockly'
import JsonConversionUtils from './json-conversion-utils'
import { has } from 'lodash'
import recursiveOmitBy from 'recursive-omit-by'
import { FieldLabelSerializableHidden } from '../components/field-label-serializable-hidden'

export default class BlocklyMiscUtils {

  static toHappyFormatting (string) {
    return string.split('_')
      .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join(' ')
  }

  static addBlock (block) {
    Blockly.Blocks[block.type] = {
      init: function () {
        this.jsonInit(block)
        if (!!block.data) {
          this.data = block.data
        }
        if (!!block.hat) {
          this.hat = block.hat
        }
        if (block.type.endsWith('SHADOW')) {
          this.setMovable(false)
        }
      }
    }
    Blockly.Blocks[block.type].json = block
    JsonConversionUtils.addBlockToMap(block)
  }

  //initializes the json specified shadow blocks of a block on the workspace
  static manuallyAddShadowBlocks (thisBlock, block) {
    for (let i = 0; i < 10; i++) {
      if (!!block['args' + i.toString()]) {
        for (let j = 0; j < 10; j++) {
          const arg = block['args' + i.toString()][j]
          if (!!arg) {
            const shadow = arg.shadow
            if (!!shadow && !thisBlock.getInput(arg.name).connection.targetBlock()) {
              let shadowBlock = JsonConversionUtils.newBlock(thisBlock.workspace, shadow.type)
              if (shadow.notActuallyShadow && !thisBlock.isShadow()) {
                if (shadow.type.endsWith('SHADOW')) {
                  shadowBlock.setMovable(false)
                }
              } else {
                shadowBlock.setShadow(true)
              }
              if (!!shadow.fields) {
                for (let field of shadow.fields) {
                  if (field.valueI !== null) {
                    shadowBlock.setFieldValue(field.valueI, field.name)
                  }
                  if (field.valueS !== null) {
                    shadowBlock.setFieldValue(field.valueS, field.name)
                  }
                  if (field.valueB !== null) {
                    shadowBlock.setFieldValue(field.valueB, field.name)
                  }
                }
              }
              const connection = arg.type.endsWith('statement') ?
                shadowBlock.previousConnection : shadowBlock.outputConnection
              thisBlock.getInput(arg.name).connection.connect(connection)
              if (!!shadowBlock.initSvg) {
                shadowBlock.initSvg()
              }
              BlocklyMiscUtils.manuallyAddShadowBlocks(shadowBlock, Blockly.Blocks[shadow.type].json)
            }
          }
        }
      }
    }

    if (block.type.startsWith('Starter')) {
      let shadowBlock = thisBlock.workspace.newBlock('Property_SHADOW')
      shadowBlock.setShadow(true)
      thisBlock.nextConnection.connect(shadowBlock.previousConnection)
      if (!!shadowBlock.initSvg) {
        shadowBlock.initSvg()
      }
    }
  }

  static inputNameToBlockType (inputName) {
    if (inputName.includes('.')) {
      inputName = inputName.split('.').slice(-1)[0]
    }
    switch (inputName) {
      case 'heroPower':
      case 'card':
        return 'Card'
      case 'cards':
        return 'Cards'
      case 'queueCondition':
      case 'fireCondition':
      case 'condition':
        return 'Condition'
      case 'spell':
      case 'spell1':
      case 'spell2':
      case 'deathrattle':
        return 'Spell'
      case 'filter':
      case 'cardFilter':
        return 'Filter'
      case 'secondaryTarget':
      case 'target':
        return 'EntityReference'
      case 'race':
        return 'Race'
      case 'sourcePlayer':
      case 'targetPlayer':
        return 'TargetPlayer'
      case 'heroClass':
        return 'HeroClass'
      case 'rarity':
        return 'Rarity'
      case 'attribute':
      case 'requiredAttribute':
        return 'Attribute'
      case 'targetSelection':
        return 'TargetSelection'
      case 'eventTrigger':
      case 'revertTrigger':
      case 'secondaryTrigger':
      case 'secret':
      case 'quest':
      case 'expirationTrigger':
      case 'secondRevertTrigger':
        return 'Trigger'
      case 'value':
      case 'howMany':
      case 'ifTrue':
      case 'ifFalse':
      case 'value1':
      case 'value2':
      case 'secondaryValue':
      case 'multiplier':
      case 'offset':
      case 'attackBonus':
      case 'hpBonus':
      case 'armorBonus':
      case 'manaCost':
      case 'mana':
      case 'manaCostModifier':
        return 'ValueProvider'
      case 'aura':
        return 'Aura'
      case 'cardSource':
        return 'Source'
      default:
        return null
    }
  }

  static blockTypeToOuput (type) {
    switch (type) {
      case 'Spell':
      case 'ValueProvider':
      case 'Condition':
      case 'Filter':
        return type + 'Desc'
      default:
        return type
    }
  }

  //make the message for a generated block for a catalogue/created card
  static cardMessage (card) {
    let ret = ''
    if (card.baseManaCost !== null) {
      ret = '(' + card.baseManaCost + ') '
    }
    if (card.type === 'MINION') {
      ret += card.baseAttack + '/' + card.baseHp
    } else {
      ret += BlocklyMiscUtils.toHappyFormatting(card.type)
    }
    ret += ' "' + card.name + '"'
    return ret
  }

  static initializeBlocks (data) {
    try {
      Blockly.fieldRegistry.register('field_label_serializable_hidden', FieldLabelSerializableHidden)
    } catch (e) {
      // already registered
    }

    this.blocklyFunctionModification()

    // All of our spells, triggers, entity reference enum values, etc.
    data.allBlock.edges.forEach(edge => {
      if (has(Blockly.Blocks, edge.node.type)) {
        return
      }

      const block = recursiveOmitBy(edge.node, ({ node }) => node === null)

      // Patch back in values from union type
      if (!!block.args) {
        block.args.forEach(args => {
          args.args.forEach(arg => {
            if (!!arg.valueI) {
              arg.value = arg.valueI
              delete arg.valueI
            }
            if (!!arg.valueS) {
              arg.value = arg.valueS
              delete arg.valueS
            }
            if (arg.hasOwnProperty('valueB')) {
              //arg.value = arg.valueB
              //gotta do this because it seems like the block -> xml conversion hates booleans
              if (arg.valueB === true) {
                arg.value = 'TRUE'
              } else if (arg.valueB === false) {
                arg.value = 'FALSE'
              }
              delete arg.valueB
            }
          })

          block['args' + args.i.toString()] = args.args
        })
        delete block.args
      }

      if (!!block.messages) {
        block.messages.forEach((message, i) => {
          block['message' + i.toString()] = message
        })
        delete block.messages
      }

      if (!!block.output && !JsonConversionUtils.blockTypeColors[block.output]) {
        JsonConversionUtils.blockTypeColors[block.output] = block.colour
      }

      BlocklyMiscUtils.addBlock(block)
    })

    BlocklyMiscUtils.initCardBlocks(data)

    let defaultFunction = Blockly.Field.prototype.setValue
    Blockly.Field.prototype.setValue = function (newValue) {
      defaultFunction.call(this, newValue)
      let source = this.sourceBlock_
      if (!!source && !!Blockly.Blocks[source.type].json) {
        let json = Blockly.Blocks[source.type].json
        if (json.output === 'Color') {
          let r = source.getFieldValue('r')
          let g = source.getFieldValue('g')
          let b = source.getFieldValue('b')
          let color = Blockly.utils.colour.rgbToHex(r, g, b)
          source.setColour(color)
        }
      }
    }
  }

  static blocklyFunctionModification () {
    Blockly.HSV_SATURATION = .65
    Blockly.Blocks = {} //we don't use any of the default Blockly blocks

    //use 2 half-width spacing rows instead of 1 full-width for the inner rows of blocks
    Blockly.blockRendering.RenderInfo.prototype.addRowSpacing_ = function () {
      let oldRows = this.rows
      this.rows = []

      for (let r = 0; r < oldRows.length; r++) {
        this.rows.push(oldRows[r])
        if (r !== oldRows.length - 1) {
          let spacerRow = this.makeSpacerRow_(oldRows[r], oldRows[r + 1])
          if (r !== oldRows.length - 2 && r !== 0) {
            spacerRow.height = spacerRow.height / 2

            let spacerRow2 = this.makeSpacerRow_(oldRows[r], oldRows[r + 1])
            spacerRow2.height = spacerRow2.height / 2
            this.rows.push(spacerRow2)
          }
          this.rows.push(spacerRow)
        }
      }
    }
    //now every single important row has a spacer or equivalent both above and below

    Blockly.blockRendering.RenderInfo.prototype.alignRowElements_ = function () {
      const Types = Blockly.blockRendering.Types
      //align statement rows normally and align input rows to nearest 10 pixels
      for (let i = 0, row; (row = this.rows[i]); i++) {
        if (row.hasStatement) {
          this.alignStatementRow_(row)
        }
        if (row.hasExternalInput && row.width > 1) {
          let happyWidth
          if (row.width < 50) {
            happyWidth = Math.ceil(row.width / 10) * 10
          } else {
            happyWidth = Math.round(row.width / 10) * 10
          }
          let missingSpace = happyWidth - row.width
          this.addAlignmentPadding_(row, missingSpace)
        }
        if (this.block_.hat && i === 2 && row.width < this.topRow.width) {
          let missingSpace = this.topRow.width - row.width
          this.addAlignmentPadding_(row, missingSpace)
        }
      }
      //spacer/top/bottom rows take on the width of their adjacent non-spacer row
      for (let i = 0, row; (row = this.rows[i]); i++) {
        if (Types.isSpacer(row) || Types.isTopOrBottomRow(row)) {
          let currentWidth = row.width
          let desiredWidth = 0

          if (Types.isSpacer(row)) {
            let aboveRow = this.rows[i + 1]
            let belowRow = this.rows[i - 1]
            if (!!aboveRow && !Types.isSpacer(aboveRow) && !Types.isTopOrBottomRow(aboveRow)) {
              desiredWidth = aboveRow.width
            }
            if (!!belowRow && !Types.isSpacer(belowRow) && !Types.isTopOrBottomRow(belowRow)) {
              desiredWidth = belowRow.width
            }
          } else if (Types.isTopRow(row)) {
            desiredWidth = this.rows[2].width
          } else if (Types.isBottomRow(row)) {
            desiredWidth = this.rows[i - 2].width
          }

          let missingSpace = desiredWidth - currentWidth
          if (missingSpace > 0) {
            this.addAlignmentPadding_(row, missingSpace)
          }
          if (Types.isTopOrBottomRow(row)) {
            row.widthWithConnectedBlocks = row.width
          }
        }
      }
    }

    Blockly.BlockSvg.prototype.bumpNeighbours = function () {
      if (!this.workspace) {
        return  // Deleted block.
      }
      if (this.workspace.isDragging()) {
        return  // Don't bump blocks during a drag.
      }
      var rootBlock = this.getRootBlock()
      if (rootBlock.isInFlyout) {
        return  // Don't move blocks around in a flyout.
      }
      // Loop through every connection on this block.
      var myConnections = this.getConnections_(false)
      for (var i = 0, connection; (connection = myConnections[i]); i++) {
        if (autoDecorate(this, connection)) {
          return
        }
        // Spider down from this block bumping all sub-blocks.
        if (connection.isConnected() && connection.isSuperior()) {
          connection.targetBlock().bumpNeighbours()
        }

        var neighbours = connection.neighbours(Blockly.SNAP_RADIUS)

        for (var j = 0, otherConnection; (otherConnection = neighbours[j]); j++) {

          // If both connections are connected, that's probably fine.  But if
          // either one of them is unconnected, then there could be confusion.
          if (!connection.isConnected() || !otherConnection.isConnected()) {
            if (otherConnection.getSourceBlock().getRootBlock() !== rootBlock) {
              // Always bump the inferior block.
              if (connection.isSuperior()) {
                otherConnection.bumpAwayFrom(connection)
              } else {
                connection.bumpAwayFrom(otherConnection)
              }
            }
          }
        }
      }
    }

    const autoDecorate = function (bumpee, connection) {
      if (connection.type === Blockly.NEXT_STATEMENT || bumpee.type.endsWith('SHADOW')) {
        return false
      }
      let workspace = bumpee.workspace
      let nexts = workspace.connectionDBList[Blockly.NEXT_STATEMENT]
      let neighbours = nexts.getNeighbours(connection, Blockly.SNAP_RADIUS)

      for (var j = 0, otherConnection; (otherConnection = neighbours[j]); j++) {
        if ((!connection.isConnected() || connection.targetBlock().isShadow())
          && (!otherConnection.isConnected() || otherConnection.targetBlock().isShadow())
          && otherConnection.type === Blockly.NEXT_STATEMENT) {
          let bumper = otherConnection.getSourceBlock()
          let addedBlock
          if (otherConnection.getCheck().includes('Properties')) {
            if (bumpee.type.startsWith('Aura_')) {
              addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_auras')
              addedBlock.getFirstStatementConnection().connect(bumpee.previousConnection)
            } else if (bumpee.type.startsWith('Spell')) {
              if (bumper.getInput('description')?.connection
                .targetBlock()?.getFieldValue('text')?.toLowerCase().includes('aftermath')) {
                addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_aftermath')
                addedBlock.getInput('deathrattle').connection.connect(bumpee.outputConnection)
              } else {
                addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_opener1')
                addedBlock.getInput('battlecry.spell').connection.connect(bumpee.outputConnection)
              }
            } else if (bumpee.type.startsWith('TargetSelection')) {
              addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_opener1')
              addedBlock.getInput('battlecry.targetSelection').connection.connect(bumpee.outputConnection)
            } else if (bumpee.type.startsWith('ValueProvider')) {
              if (bumper.getInput('description')?.connection
                .targetBlock()?.getFieldValue('text')?.toLowerCase().includes('if')) {
                addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_cost_modifier_conditional')
                addedBlock.getInput('manaCostModifier.ifTrue').connection.connect(bumpee.outputConnection)
              } else {
                addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_cost_modifier')
                addedBlock.getInput('manaCostModifier').connection.connect(bumpee.outputConnection)
              }
            } else if (bumpee.type.startsWith('Condition')) {
              if (bumper.getInput('description')?.connection
                .targetBlock()?.getFieldValue('text')?.toLowerCase().includes('opener')) {
                addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_opener2')
                addedBlock.getInput('battlecry.condition').connection.connect(bumpee.outputConnection)
              } else {
                addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_condition')
                addedBlock.getInput('condition').connection.connect(bumpee.outputConnection)
              }
            } else if (bumpee.type.startsWith('Property_attributes_')) {
              addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_attributes')
              addedBlock.getFirstStatementConnection().connect(bumpee.previousConnection)
            } else if (bumpee.type.startsWith('Attribute')) {
              addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_attributes')
              let anotherBlock
              if (bumpee.json?.output === 'IntAttribute') {
                anotherBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_attributes_int')
              } else {
                anotherBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_attributes_boolean')
              }
              anotherBlock.getInput('attribute').connection.connect(bumpee.outputConnection)
              if (anotherBlock.initSvg) {
                anotherBlock.initSvg()
              }
              addedBlock.getFirstStatementConnection().connect(anotherBlock.previousConnection)
            } else if (bumpee.type.startsWith('Enchantment')) {
              addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_triggers')
              addedBlock.getFirstStatementConnection().connect(bumpee.previousConnection)
            } else if (bumpee.type.startsWith('Trigger')) {
              addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_triggers')
              let anotherBlock = BlocklyMiscUtils.newBlock(workspace, 'Enchantment')
              anotherBlock.getInput('eventTrigger').connection.connect(bumpee.outputConnection)
              if (anotherBlock.initSvg) {
                anotherBlock.initSvg()
              }
              addedBlock.getFirstStatementConnection().connect(anotherBlock.previousConnection)
            } else {
              continue
            }
          } else if (otherConnection.getCheck().includes('Property_attributes') && bumpee.type.startsWith('Attribute_')) {
            if (bumpee.json?.output === 'IntAttribute') {
              addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_attributes_int')
            } else {
              addedBlock = BlocklyMiscUtils.newBlock(workspace, 'Property_attributes_boolean')
            }
            addedBlock.getInput('attribute').connection.connect(bumpee.outputConnection)
          } else if ((otherConnection.getCheck().includes('Spells') && bumpee.type.startsWith('Spell_'))
            || (otherConnection.getCheck().includes('Cards') && bumpee.type.startsWith('Card_'))
            || (otherConnection.getCheck().includes('Conditions') && bumpee.type.startsWith('Condition_'))
            || (otherConnection.getCheck().includes('Sources') && bumpee.type.startsWith('Source_'))
            || (otherConnection.getCheck().includes('Filters') && bumpee.type.startsWith('Filter_'))) {
            addedBlock = BlocklyMiscUtils.newBlock(workspace, bumpee.type.split('_')[0] + '_I')
            addedBlock.getInput('i').connection.connect(bumpee.outputConnection)
          } else {
            continue
          }

          if (!!addedBlock) {
            otherConnection.connect(addedBlock.previousConnection)
            if (addedBlock.initSvg) {
              addedBlock.initSvg()
              workspace.render()
            }
            return true
          }
        }
      }

      return false
    }
  }

  static getHeroClassColors (data) {
    const newHeroClassColors = {
      ANY: '#A6A6A6'
    }

    /**
     * first pass through the card catalogue to figure out all the collectible
     * hero classes and their colors
     */
    data.allCard.edges.forEach(edge => {
      let card = edge.node
      let type = 'HeroClass_' + card.heroClass
      if (has(Blockly.Blocks, type)) {
        return
      }
      if (card.type === 'CLASS' && card.collectible) {
        let color = Blockly.utils.colour.rgbToHex(
          card.art.primary.r * 255,
          card.art.primary.g * 255,
          card.art.primary.b * 255
        )

        newHeroClassColors[card.heroClass] = color
        let block = {
          'type': type,
          'message0': card.name,
          'output': 'HeroClass',
          'colour': color,
          'data': card.heroClass
        }
        BlocklyMiscUtils.addBlock(block)
      }
    })
    return newHeroClassColors
  }

  static initCardBlocks (data) {
    const heroClassColors = BlocklyMiscUtils.getHeroClassColors(data)
    //second pass through to actually get the cards
    data.allCard.edges.forEach(edge => {
      let card = edge.node
      let type = 'CatalogueCard_' + card.id
      if (has(Blockly.Blocks, type)) {
        return
      }
      if (heroClassColors.hasOwnProperty(card.heroClass)) { //this check if it's *really* collectible
        let color = heroClassColors[card.heroClass]
        let block = {
          'type': type,
          'args0': [],
          'message0': BlocklyMiscUtils.cardMessage(card),
          'output': 'Card',
          'colour': color,
          'data': card.id
        }
        BlocklyMiscUtils.addBlock(block)
      }
    })
  }

  /**
   * Helper method to make sure added blocks have the correct shadows
   * We still want those in case people decide to pull apart the converted stuff
   * @param workspace The workspace
   * @param type The block type to create
   * @returns The created block
   */
  static newBlock (workspace, type) {
    let block = workspace.newBlock(type)
    this.manuallyAddShadowBlocks(block, Blockly.Blocks[type].json)
    return block
  }
}

export function createCard (card, workspace, cardsStillInUse, heroClassColors) {
  if (!!card && !!card.name && !!card.type) {
    let cardType = !!card.secret ? 'SECRET' : !!card.quest ? 'QUEST' : card.type
    let cardId = cardType.toLowerCase()
      + '_'
      + card.name
        .toLowerCase()
        .replace(' ', '_')
        .replace(',', '')
        .replace('\'', '')
    if (card.type === 'MINION' && card.collectible === false || card.collectible === 'FALSE') {
      cardId.replace('minion_', 'token_')
    }
    if (card.type === 'CLASS') {
      cardId = 'class_' + card.heroClass.toLowerCase()
    }
    let type = 'WorkspaceCard_' + cardId
    let color = '#888888'
    if (!!card.heroClass) {
      color = heroClassColors[card.heroClass]
    }
    let block = {
      init: function () {
        this.jsonInit({
          'type': type,
          'message0': BlocklyMiscUtils.cardMessage(card),
          'output': 'Card',
          'colour': color
        })
        this.data = cardId
      }
    }
    if (!Blockly.Blocks[type.replace('WorkspaceCard_', 'CatalogueCard_')]) {
      cardsStillInUse.push(type)
    }
    if (Blockly.Blocks[type] !== block) {
      Blockly.Blocks[type] = block
      return true
    }
    return false
  }

}//Turns our own json formatting for shadow blocks into the formatting
export function getToolboxCategories (onlyCategory = null, gatsbyShapedData = null, toolboxCategories = null, results = null) {
  let index = -1
  return gatsbyShapedData.toolbox.BlockCategoryList.map(({
    BlockTypePrefix, CategoryName, ColorHex
  }) => {
    index++
    if (!!onlyCategory && CategoryName !== onlyCategory) {
      return toolboxCategories[index] //my attempt to reduce the runtime a bit
    }
    let blocks = []
    if (!!BlockTypePrefix) {
      for (let blocksKey in Blockly.Blocks) {
        if ((!blocksKey.endsWith('SHADOW') && blocksKey.startsWith(BlockTypePrefix))
          || (CategoryName === 'Cards' && blocksKey.startsWith('WorkspaceCard'))) {
          blocks.push({
            type: blocksKey,
            values: shadowBlockJsonCreation(blocksKey),
            next: blocksKey.startsWith('Starter') && !!Blockly.Blocks[blocksKey].json.nextStatement ?
              { type: 'Property_SHADOW', shadow: true }
              : undefined
          })
        }
      }

      if (!JsonConversionUtils.blockTypeColors[BlockTypePrefix]) {
        JsonConversionUtils.blockTypeColors[BlockTypePrefix] = ColorHex
      }
    } else if (CategoryName === 'Search Results') {
      results.forEach(value => {
        blocks.push({
          type: value.id,
          values: shadowBlockJsonCreation(value.id),
          next: value.id.startsWith('Starter') && !!Blockly.Blocks[value.id].json.nextStatement ?
            { type: 'Property_SHADOW', shadow: true }
            : undefined
        })
      })
    }
    let button = []
    if (CategoryName === 'Cards') {
      button[0] = {
        text: 'Add External Card Code to Workspace',
        callbackKey: 'importCard'
      }
    }

    return {
      name: CategoryName,
      blocks: blocks,
      colour: ColorHex,
      button: button
    }
  })
}

//that's used for specifying toolbox categories (recursively)
function shadowBlockJsonCreation (type) {
  let block = Blockly.Blocks[type]
  let values = {}
  if (!!block && !!block.json) {
    let json = block.json
    for (let i = 0; i < 10; i++) {
      if (!!json['args' + i.toString()]) {
        for (let j = 0; j < 10; j++) {
          const arg = json['args' + i.toString()][j]
          if (!!arg && !!arg.shadow) {
            let fields = {}
            if (!!arg.shadow.fields) {
              for (let field of arg.shadow.fields) {
                fields[field.name] = field.valueI || field.valueS || field.valueB
              }
            }
            values[arg.name] = {
              type: arg.shadow.type,
              shadow: !arg.shadow.notActuallyShadow,
              fields: fields,
              values: shadowBlockJsonCreation(arg.shadow.type)
            }
          }
        }
      }
    }
  }
  return values
}

export function generateCard (data, mainWorkspace: Blockly.Workspace = Blockly.getMainWorkspace(), p: string = null) {
  let cardId = null
  let card = null

  if (!p) {
    return
  }

  if (p.includes('{')) {
    card = JSON.parse(p)
  } else if (p.includes('www')) {
    cardId = p.split('cards/')[1]
  } else if (p.includes('_')) {
    cardId = p
  } else {
    for (let edge of data.allCard.edges) {
      if (edge.node.name.toLowerCase() === p.toLowerCase()) {
        cardId = edge.node.id
        break
      }
    }
  }
  if (!!cardId) {
    for (let edge of data.allFile.edges) {
      let node = edge.node
      if (node.name === cardId) {
        card = JSON.parse(node.internal.content)
      }
    }
  }

  if (!card) {
    return
  }

  JsonConversionUtils.generateCard(mainWorkspace, card)
}