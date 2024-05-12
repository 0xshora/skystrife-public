// import { Entity } from "@latticexyz/recs";
import { PlayerRate } from "./MatchTable";
import { ViewOnlyPlayerRankingsContainer } from "./ViewOnlyPlayerRankingsContainer";
// import { ViewOnlyMatchListingContainer } from "./MatchListingContainer";
// import { ViewOnlyMatchRow } from "./ViewOnlyMatchRow";
import { ViewOnlyPlayerRow } from "./ViewOnlyPlayerRow";

export function PlayerRankings({ players }: { players: PlayerRate[] }) {
  // return <div></div>;
  return <ViewOnlyPlayerRankingsContainer players={players} playerRowComponent={ViewOnlyPlayerRow} />;
  // return <ViewOnlyPlayerRankingsContainer allMatches={matches} matchRowComponent={ViewOnlyMatchRow} />;
}
