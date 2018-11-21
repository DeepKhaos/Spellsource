/*
 * Hidden Switch Spellsource API
 * The Spellsource API for matchmaking, user accounts, collections management and more.  To get started, create a user account and make sure to include the entirety of the returned login token as the X-Auth-Token header. You can reuse this token, or login for a new one.  ClientToServerMessage and ServerToClientMessage are used for the realtime game state and actions two-way websocket interface for actually playing a game. Envelope is used for the realtime API services. 
 *
 * OpenAPI spec version: 2.1.0
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
import com.hiddenswitch.spellsource.client.models.MatchmakingQueuePutRequest;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.io.Serializable;

/**
 * Accepts an invite to a match or a friend invite. 
 */
@ApiModel(description = "Accepts an invite to a match or a friend invite. ")

public class AcceptInviteRequest implements Serializable {
  private static final long serialVersionUID = 1L;

  @JsonProperty("awaitGameStart")
  private Boolean awaitGameStart = null;

  @JsonProperty("match")
  private MatchmakingQueuePutRequest match = null;

  public AcceptInviteRequest awaitGameStart(Boolean awaitGameStart) {
    this.awaitGameStart = awaitGameStart;
    return this;
  }

   /**
   * When true, specifies that the method call should only return when the game is actually ready to join 
   * @return awaitGameStart
  **/
  @ApiModelProperty(value = "When true, specifies that the method call should only return when the game is actually ready to join ")
  public Boolean isAwaitGameStart() {
    return awaitGameStart;
  }

  public void setAwaitGameStart(Boolean awaitGameStart) {
    this.awaitGameStart = awaitGameStart;
  }

  public AcceptInviteRequest match(MatchmakingQueuePutRequest match) {
    this.match = match;
    return this;
  }

   /**
   * Get match
   * @return match
  **/
  @ApiModelProperty(value = "")
  public MatchmakingQueuePutRequest getMatch() {
    return match;
  }

  public void setMatch(MatchmakingQueuePutRequest match) {
    this.match = match;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AcceptInviteRequest acceptInviteRequest = (AcceptInviteRequest) o;
    return Objects.equals(this.awaitGameStart, acceptInviteRequest.awaitGameStart) &&
        Objects.equals(this.match, acceptInviteRequest.match);
  }

  @Override
  public int hashCode() {
    return Objects.hash(awaitGameStart, match);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class AcceptInviteRequest {\n");
    
    sb.append("    awaitGameStart: ").append(toIndentedString(awaitGameStart)).append("\n");
    sb.append("    match: ").append(toIndentedString(match)).append("\n");
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

