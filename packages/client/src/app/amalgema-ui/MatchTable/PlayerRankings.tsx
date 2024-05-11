import { Entity } from "@latticexyz/recs";
import { ViewOnlyPlayerRankingsContainer } from "./ViewOnlyPlayerRankingsContainer";
// import { ViewOnlyMatchListingContainer } from "./MatchListingContainer";
// import { ViewOnlyMatchRow } from "./ViewOnlyMatchRow";
import { ViewOnlyPlayerRow } from "./ViewOnlyPlayerRow";

export function PlayerRankings({ matches }: { matches: Entity[] }) {
  // return <div></div>;
  return <ViewOnlyPlayerRankingsContainer allMatches={matches} playerRowComponent={ViewOnlyPlayerRow} />;
  // return <ViewOnlyPlayerRankingsContainer allMatches={matches} matchRowComponent={ViewOnlyMatchRow} />;
}
