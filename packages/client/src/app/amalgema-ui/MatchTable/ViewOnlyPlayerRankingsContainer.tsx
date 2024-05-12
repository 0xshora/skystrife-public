import { Entity, getComponentValue } from "@latticexyz/recs";
import { usePagination } from "../hooks/usePagination";
import React, { useState } from "react";
import { sleep } from "@latticexyz/utils";
import { LoadingSpinner } from "../../ui/Theme/SkyStrife/Icons/LoadingSpinner";
import { JoinModal } from "./JoinModal";
import { useAmalgema } from "../../../useAmalgema";
import { Hex } from "viem";


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
  allMatches,
  playerRowComponent,
  header,
}: {
  allMatches: Entity[];
  playerRowComponent: React.ComponentType<{ playerEntity: Entity }>;
  header?: React.ReactNode;
}) {
  const {
    components: { MatchConfig, Name, MatchRanking},
  } = useAmalgema();

  const pageSize = 10;
  // convert all mathces to all players
  const allPlayers: string[] = []; 
  
  console.log("allMatches.length: ", allMatches.length);

  // calculate all players Elo score
  allMatches.forEach((match) => {
    const matchConfig = getComponentValue(MatchConfig, match);
    if (matchConfig) {
      console.log("match: ", match);
      console.log("matchConfig: ", matchConfig);

      // have to change from createdBy user to all player addresses
      const createdBy = matchConfig.createdBy as Hex;
      const matchRanking = getComponentValue(MatchRanking, match)?.value ?? [];

      // const matchRanking = [
      //   { id: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"},
      // //   // { id: "0x2", name: "Bob", eloScore: 1150 },
      // //   // { id: "0x3", name: "Charlie", eloScore: 1100 },
      // //   // { id: "0x4", name: "Diana", eloScore: 1050 }
      // ];
      console.log("matchRanking: ", matchRanking);

      matchRanking.map((playerEntity, i) => {
        // playerEntity's rank is i
        // stack matchRanking Results or calculate Elo score here

        console.log("playerEntity: ", playerEntity);
        console.log("rank: ", i);

        // const player = getComponentValue(Name, playerEntity)?.value ?? playerEntity;
        // allPlayers.push(player);
      });

      // const Player1 = ranking.makePlayer()
      // const Player2 = ranking.makePlayer()
      // const Player3 = ranking.makePlayer()

      
      

      // return (
      //   <div className="w-full flex flex-wrap">
      //     {matchRanking.map((playerEntity, i) => {
      //       return (
      //         <span key={`rank-${i}`} className="w-1/2 flex items-baseline gap-x-1 text-ss-text-default overflow-auto">
      //           {i + 1} <PlayerName entity={encodeMatchEntity(matchEntity, playerEntity)} />
      //         </span>
      //       );
      //     })}
      //   </div>
      // );
      
      const playerName = getComponentValue(Name, createdBy)?.value ?? createdBy;
      
      // console.log("playername ", playerName);

      // const matchRankings = getComponentValue(MatchRanking, match)?.value ?? [];
      // console.log("matchRankings: ", matchRankings);

      allPlayers.push(playerName);
    }
  });

  console.log("allPlayers: ", allPlayers);


  const { page, form: paginationForm } = usePagination({ totalItems: allPlayers.length, pageSize });
  
  const shownPlayers = allPlayers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="grow flex flex-col relative">
      {header && (
        <div className="flex flex-row w-full bg-ss-bg-1 h-[48px] px-4 border-b border-ss-stroke">{header}</div>
      )}

      <div className="flex flex-row gap-x-8 w-full items-center bg-white h-[48px] px-4 text-ss-text-light text-sm uppercase border-b border-ss-stroke">
        <div className="min-w-[120px] text-left">Player Name</div>

        {/* <div className="w-[120px] text-center">Date Played</div> */}

        <div className="flex justify-center items-center w-[120px] shrink-0">Ranking Score</div>

        {/* <div className="w-[240px] text-left shrink-0">Players</div> */}
      </div>

      <div
        style={{
          height: `calc(100% - ${header ? 96 : 48}px)`,
          top: `${header ? 96 : 48}px`,
        }}
        className={`absolute left-0 overflow-y-auto w-full`}
      >
        {shownPlayers.map((playerEntity) => {
          return React.createElement(playerRowComponent, { playerEntity, key: playerEntity });
        })}

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
