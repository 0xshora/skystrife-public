import { Entity, getComponentValue } from "@latticexyz/recs";
import { usePagination } from "../hooks/usePagination";
import React, { useState } from "react";
import { sleep } from "@latticexyz/utils";
import { LoadingSpinner } from "../../ui/Theme/SkyStrife/Icons/LoadingSpinner";
import { JoinModal } from "./JoinModal";
import { useAmalgema } from "../../../useAmalgema";
import { Hex } from "viem";
import { PlayerRate } from "./MatchTable";



// export function PlayerRankingsContainer({
//   allMatches,
//   matchRowComponent,
//   header,
// }: {
//   allMatches: Entity[];
//   matchRowComponent: React.ComponentType<{ matchEntity: Entity; setViewingMatchEntity: (e: Entity) => void }>;
//   header?: React.ReactNode;
// }) {
//   const [loading, setLoading] = useState(false);
//   const [viewingMatchEntity, setViewingMatchEntity] = useState<Entity | null>(null);

//   const onPageChange = async (state: "start" | "done") => {
//     setLoading(state === "start");
//     await sleep(1);
//   };
//   const pageSize = 10;
//   const { page, form: paginationForm } = usePagination({ totalItems: allMatches.length, pageSize, onPageChange });
//   const shownMatches = allMatches.slice((page - 1) * pageSize, page * pageSize);

//   return (
//     <div className="grow flex flex-col relative">
//       <JoinModal
//         isOpen={Boolean(viewingMatchEntity)}
//         setIsOpen={() => setViewingMatchEntity(null)}
//         matchEntity={viewingMatchEntity ?? ("0x0" as Entity)}
//       />

//       {header && (
//         <div className="flex flex-row w-full bg-ss-bg-1 h-[48px] px-4 border-b border-ss-stroke">{header}</div>
//       )}

//       <div className="flex flex-row gap-x-8 w-full items-center bg-white h-[48px] px-4 text-ss-text-light text-sm uppercase border-b border-ss-stroke">
//         <div className="grow min-w-[120px] text-left">Match Name</div>

//         <div className="w-[100px] text-center shrink-0">Players</div>

//         <div className="w-[120px] text-center shrink-0">Map</div>

//         <div className="w-[100px] text-center shrink-0">Entrance Fee</div>

//         <div className="w-[100px] text-center shrink-0">Reward Pool</div>

//         <div className="w-[100px] text-center shrink-0"></div>
//       </div>

//       <div
//         style={{
//           height: `calc(100% - ${header ? 96 : 48}px)`,
//           top: `${header ? 96 : 48}px`,
//         }}
//         className={`absolute left-0 overflow-y-auto w-full`}
//       >
//         {loading ? (
//           <div className="w-full">
//             <div className="mx-auto w-fit h-[240px] flex flex-col justify-around -mb-4">
//               <LoadingSpinner />
//             </div>
//           </div>
//         ) : (
//           shownMatches.map((matchEntity) => {
//             return React.createElement(matchRowComponent, { matchEntity, key: matchEntity, setViewingMatchEntity });
//           })
//         )}

//         <div className="w-full">
//           <div className="h-4" />
//           <div className="w-fit mx-auto">{paginationForm}</div>
//           <div className="h-4" />
//         </div>
//       </div>
//     </div>
//   );
// }

export function ViewOnlyPlayerRankingsContainer ({
  players,
  playerRowComponent,
  header,
}: {
  players: PlayerRate[];
  playerRowComponent: React.ComponentType<{ player: PlayerRate }>;
  header?: React.ReactNode;
}) {
  const {
    components: { MatchConfig, Name, MatchRanking},
  } = useAmalgema();

  const pageSize = 10;
  // convert all mathces to all players
  // const allPlayers: string[] = []; 
  const allPlayers = players;
  
  // console.log("allPlayers.length: ", players.length);

  // console.log("allPlayers: ", allPlayers);

  const { page, form: paginationForm } = usePagination({ totalItems: allPlayers.length, pageSize });
  
  const shownPlayers = allPlayers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="grow flex flex-col relative">
      {header && (
        <div className="flex flex-row w-full bg-ss-bg-1 h-[48px] px-4 border-b border-ss-stroke">{header}</div>
      )}

      <div className="flex flex-row gap-x-8 w-full items-center bg-white h-[48px] px-4 text-ss-text-light text-sm uppercase border-b border-ss-stroke">
        
        
        <div className="w-[120px] text-center">Rank</div>

        {/* <div className="w-[120px] text-center">Date Played</div> */}
        <div className="flex-grow text-left pl-4 shrink-0">Player Name</div>
        <div className="w-[240px] text-center shrink-0">Ranking Score</div>

        {/* <div className="w-[240px] text-left shrink-0">Players</div> */}
      </div>

      <div
        style={{
          height: `calc(100% - ${header ? 96 : 48}px)`,
          top: `${header ? 96 : 48}px`,
        }}
        className={`absolute left-0 overflow-y-auto w-full`}
      >
        {/* { <div>shora</div> } */}
        {shownPlayers.map((player, index) => React.createElement(playerRowComponent, {
          player,
          rank: index + 1 + (page - 1) * pageSize,  // 現在のページとインデックスから実際のランキングを計算
          key: player.player
        }))}
        {/* {shownPlayers.map((player) => {
          return React.createElement(playerRowComponent, { player, key: player.player });
        })} */}

        {/* {
          <div>player a</div>
          // shownPlayers.map((playerEntity) => {
          //   return React.createElement(matchRowComponent, { matchEntity: player, key: player });
          // })
        } */}
        {/* {shownMatches.map((matchEntity) => {
          return React.createElement(matchRowComponent, { matchEntity, key: matchEntity });
        })} */}

        <div className="w-full">
          <div className="h-4" />
          <div className="w-fit mx-auto">{paginationForm}</div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
