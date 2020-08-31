/*
 * Hidden Switch Spellsource API
 * The Spellsource API for matchmaking, user accounts, collections management and more.  To get started, create a user account and make sure to include the entirety of the returned login token as the X-Auth-Token header. You can reuse this token, or login for a new one.  ClientToServerMessage and ServerToClientMessage are used for the realtime game state and actions two-way websocket interface for actually playing a game. Envelope is used for the realtime API services.  For the routes that correspond to the paths in this file, visit the Gateway.java file in the Spellsource-Server GitHub repository located in this definition file. 
 *
 * OpenAPI spec version: 4.0.1
 * Contact: ben@hiddenswitch.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


package com.hiddenswitch.spellsource.client.models;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.hiddenswitch.spellsource.client.models.Color;
import com.hiddenswitch.spellsource.client.models.Font;
import com.hiddenswitch.spellsource.client.models.Prefab;
import com.hiddenswitch.spellsource.client.models.Sprite;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Contains information the client needs for an art asset. 
 */
@ApiModel(description = "Contains information the client needs for an art asset. ")
@JsonInclude(JsonInclude.Include.NON_DEFAULT)

public class Art implements Serializable {

  @JsonProperty("sprite")
  private Sprite sprite = null;

  @JsonProperty("spriteShadow")
  private Sprite spriteShadow = null;

  @JsonProperty("missile")
  private Prefab missile = null;

  @JsonProperty("onHit")
  private Prefab onHit = null;

  @JsonProperty("onCast")
  private Prefab onCast = null;

  @JsonProperty("loop")
  private Prefab loop = null;

  @JsonProperty("spell")
  private Prefab spell = null;

  @JsonProperty("primary")
  private Color primary = null;

  @JsonProperty("secondary")
  private Color secondary = null;

  @JsonProperty("highlight")
  private Color highlight = null;

  @JsonProperty("shadow")
  private Color shadow = null;

  @JsonProperty("body")
  private Font body = null;

  @JsonProperty("glow")
  private Color glow = null;

  public Art sprite(Sprite sprite) {
    this.sprite = sprite;
    return this;
  }

   /**
   * Get sprite
   * @return sprite
  **/
  @ApiModelProperty(value = "")
  public Sprite getSprite() {
    return sprite;
  }

  public void setSprite(Sprite sprite) {
    this.sprite = sprite;
  }

  public Art spriteShadow(Sprite spriteShadow) {
    this.spriteShadow = spriteShadow;
    return this;
  }

   /**
   * Get spriteShadow
   * @return spriteShadow
  **/
  @ApiModelProperty(value = "")
  public Sprite getSpriteShadow() {
    return spriteShadow;
  }

  public void setSpriteShadow(Sprite spriteShadow) {
    this.spriteShadow = spriteShadow;
  }

  public Art missile(Prefab missile) {
    this.missile = missile;
    return this;
  }

   /**
   * Get missile
   * @return missile
  **/
  @ApiModelProperty(value = "")
  public Prefab getMissile() {
    return missile;
  }

  public void setMissile(Prefab missile) {
    this.missile = missile;
  }

  public Art onHit(Prefab onHit) {
    this.onHit = onHit;
    return this;
  }

   /**
   * Get onHit
   * @return onHit
  **/
  @ApiModelProperty(value = "")
  public Prefab getOnHit() {
    return onHit;
  }

  public void setOnHit(Prefab onHit) {
    this.onHit = onHit;
  }

  public Art onCast(Prefab onCast) {
    this.onCast = onCast;
    return this;
  }

   /**
   * Get onCast
   * @return onCast
  **/
  @ApiModelProperty(value = "")
  public Prefab getOnCast() {
    return onCast;
  }

  public void setOnCast(Prefab onCast) {
    this.onCast = onCast;
  }

  public Art loop(Prefab loop) {
    this.loop = loop;
    return this;
  }

   /**
   * Get loop
   * @return loop
  **/
  @ApiModelProperty(value = "")
  public Prefab getLoop() {
    return loop;
  }

  public void setLoop(Prefab loop) {
    this.loop = loop;
  }

  public Art spell(Prefab spell) {
    this.spell = spell;
    return this;
  }

   /**
   * Get spell
   * @return spell
  **/
  @ApiModelProperty(value = "")
  public Prefab getSpell() {
    return spell;
  }

  public void setSpell(Prefab spell) {
    this.spell = spell;
  }

  public Art primary(Color primary) {
    this.primary = primary;
    return this;
  }

   /**
   * Get primary
   * @return primary
  **/
  @ApiModelProperty(value = "")
  public Color getPrimary() {
    return primary;
  }

  public void setPrimary(Color primary) {
    this.primary = primary;
  }

  public Art secondary(Color secondary) {
    this.secondary = secondary;
    return this;
  }

   /**
   * Get secondary
   * @return secondary
  **/
  @ApiModelProperty(value = "")
  public Color getSecondary() {
    return secondary;
  }

  public void setSecondary(Color secondary) {
    this.secondary = secondary;
  }

  public Art highlight(Color highlight) {
    this.highlight = highlight;
    return this;
  }

   /**
   * Get highlight
   * @return highlight
  **/
  @ApiModelProperty(value = "")
  public Color getHighlight() {
    return highlight;
  }

  public void setHighlight(Color highlight) {
    this.highlight = highlight;
  }

  public Art shadow(Color shadow) {
    this.shadow = shadow;
    return this;
  }

   /**
   * Get shadow
   * @return shadow
  **/
  @ApiModelProperty(value = "")
  public Color getShadow() {
    return shadow;
  }

  public void setShadow(Color shadow) {
    this.shadow = shadow;
  }

  public Art body(Font body) {
    this.body = body;
    return this;
  }

   /**
   * Get body
   * @return body
  **/
  @ApiModelProperty(value = "")
  public Font getBody() {
    return body;
  }

  public void setBody(Font body) {
    this.body = body;
  }

  public Art glow(Color glow) {
    this.glow = glow;
    return this;
  }

   /**
   * Get glow
   * @return glow
  **/
  @ApiModelProperty(value = "")
  public Color getGlow() {
    return glow;
  }

  public void setGlow(Color glow) {
    this.glow = glow;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Art art = (Art) o;
    return Objects.equals(this.sprite, art.sprite) &&
        Objects.equals(this.spriteShadow, art.spriteShadow) &&
        Objects.equals(this.missile, art.missile) &&
        Objects.equals(this.onHit, art.onHit) &&
        Objects.equals(this.onCast, art.onCast) &&
        Objects.equals(this.loop, art.loop) &&
        Objects.equals(this.spell, art.spell) &&
        Objects.equals(this.primary, art.primary) &&
        Objects.equals(this.secondary, art.secondary) &&
        Objects.equals(this.highlight, art.highlight) &&
        Objects.equals(this.shadow, art.shadow) &&
        Objects.equals(this.body, art.body) &&
        Objects.equals(this.glow, art.glow);
  }

  @Override
  public int hashCode() {
    return Objects.hash(sprite, spriteShadow, missile, onHit, onCast, loop, spell, primary, secondary, highlight, shadow, body, glow);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Art {\n");
    
    sb.append("    sprite: ").append(toIndentedString(sprite)).append("\n");
    sb.append("    spriteShadow: ").append(toIndentedString(spriteShadow)).append("\n");
    sb.append("    missile: ").append(toIndentedString(missile)).append("\n");
    sb.append("    onHit: ").append(toIndentedString(onHit)).append("\n");
    sb.append("    onCast: ").append(toIndentedString(onCast)).append("\n");
    sb.append("    loop: ").append(toIndentedString(loop)).append("\n");
    sb.append("    spell: ").append(toIndentedString(spell)).append("\n");
    sb.append("    primary: ").append(toIndentedString(primary)).append("\n");
    sb.append("    secondary: ").append(toIndentedString(secondary)).append("\n");
    sb.append("    highlight: ").append(toIndentedString(highlight)).append("\n");
    sb.append("    shadow: ").append(toIndentedString(shadow)).append("\n");
    sb.append("    body: ").append(toIndentedString(body)).append("\n");
    sb.append("    glow: ").append(toIndentedString(glow)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }

}

