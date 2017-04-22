/**
 * Hidden Switch Minionate API
 * The Minionate API for matchmaking, user accounts, collections management and more
 *
 * OpenAPI spec version: 1.0.1
 * Contact: benjamin.s.berman@gmail.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


package com.hiddenswitch.proto3.net.client.models;

import java.util.Objects;
import com.google.gson.annotations.SerializedName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

import java.io.Serializable;
/**
 * EntityLocation
 */

public class EntityLocation  implements Serializable {
  @SerializedName("player")
  private Integer player = null;

  @SerializedName("index")
  private Integer index = null;

  /**
   * Gets or Sets zone
   */
  public enum ZoneEnum {
    @SerializedName("NONE")
    NONE("NONE"),
    
    @SerializedName("HAND")
    HAND("HAND"),
    
    @SerializedName("DECK")
    DECK("DECK"),
    
    @SerializedName("GRAVEYARD")
    GRAVEYARD("GRAVEYARD"),
    
    @SerializedName("BATTLEFIELD")
    BATTLEFIELD("BATTLEFIELD"),
    
    @SerializedName("SECRET")
    SECRET("SECRET"),
    
    @SerializedName("HERO_POWER")
    HERO_POWER("HERO_POWER"),
    
    @SerializedName("HERO")
    HERO("HERO"),
    
    @SerializedName("WEAPON")
    WEAPON("WEAPON"),
    
    @SerializedName("SET_ASIDE_ZONE")
    SET_ASIDE_ZONE("SET_ASIDE_ZONE"),
    
    @SerializedName("HIDDEN")
    HIDDEN("HIDDEN"),
    
    @SerializedName("PLAYER")
    PLAYER("PLAYER");

    private String value;

    ZoneEnum(String value) {
      this.value = value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }
  }

  @SerializedName("zone")
  private ZoneEnum zone = null;

  public EntityLocation player(Integer player) {
    this.player = player;
    return this;
  }

   /**
   * Get player
   * @return player
  **/
  @ApiModelProperty(example = "null", required = true, value = "")
  public Integer getPlayer() {
    return player;
  }

  public void setPlayer(Integer player) {
    this.player = player;
  }

  public EntityLocation index(Integer index) {
    this.index = index;
    return this;
  }

   /**
   * Get index
   * @return index
  **/
  @ApiModelProperty(example = "null", required = true, value = "")
  public Integer getIndex() {
    return index;
  }

  public void setIndex(Integer index) {
    this.index = index;
  }

  public EntityLocation zone(ZoneEnum zone) {
    this.zone = zone;
    return this;
  }

   /**
   * Get zone
   * @return zone
  **/
  @ApiModelProperty(example = "null", required = true, value = "")
  public ZoneEnum getZone() {
    return zone;
  }

  public void setZone(ZoneEnum zone) {
    this.zone = zone;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    EntityLocation entityLocation = (EntityLocation) o;
    return Objects.equals(this.player, entityLocation.player) &&
        Objects.equals(this.index, entityLocation.index) &&
        Objects.equals(this.zone, entityLocation.zone);
  }

  @Override
  public int hashCode() {
    return Objects.hash(player, index, zone);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class EntityLocation {\n");
    
    sb.append("    player: ").append(toIndentedString(player)).append("\n");
    sb.append("    index: ").append(toIndentedString(index)).append("\n");
    sb.append("    zone: ").append(toIndentedString(zone)).append("\n");
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

