import { useMemo, useState, useEffect } from "react";
import { Card } from "../../ui/Theme/SkyStrife/Card";
import { twMerge } from "tailwind-merge";
import { useSummonIslandModal } from "../SummonIsland";
import { useAmalgema } from "../../../useAmalgema";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Plus } from "../../ui/Theme/SkyStrife/Icons/Plus";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { OpenMatches } from "./OpenMatches";
import { SpectateMatches } from "./SpectateMatches";
import { HistoricalMatches } from "./HistoricalMatches";
import { CreatedBy, DisplayNameWithLink } from "../CreatedBy";
import { encodeMatchEntity } from "../../../encodeMatchEntity";
import { addressToEntityID } from "../../../mud/setupNetwork";
import { Hex } from "viem";
import { PlayerRankings } from "./PlayerRankings";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue, Not, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";

import player_ratings from "../../../public/ratings/player_ratings.json";
// import { fetchRecords } from "../fetchRecords";

enum Tabs {
  Play = "play",
  Spectate = "spectate",
  Historical = "historical",
  Rankings = "rankings",
}

const BUGGED_MATCHES = [] as Entity[];

export interface PlayerRate {
  address: string;
  mu: number;
  sigma: number;
}

interface PlayerRankingsProps {
  players: PlayerRate[];
}


export function MatchTable() {
  const {
    components: { MatchConfig, MatchFinished, MatchJoinable, MatchReady, Name, MatchRanking},
  } = useAmalgema();

  // for getting player name

  const [currentTab, setCurrentTab] = useState<Tabs>(Tabs.Play);

  const openMatches = useEntityQuery([
    Has(MatchConfig),
    HasValue(MatchJoinable, { value: true }),
    Has(MatchReady),
    Not(MatchFinished),
  ]);
  const pendingMatches = useEntityQuery([
    Has(MatchConfig),
    HasValue(MatchJoinable, { value: true }),
    Not(MatchReady),
    Not(MatchFinished),
  ]);
  
  const allMatches = openMatches.concat(pendingMatches).filter((match) => !BUGGED_MATCHES.includes(match));

  const joinableMatches = allMatches;

  const historicalMatches = useEntityQuery([Has(MatchConfig), Has(MatchFinished)]);
  historicalMatches.sort((a, b) => {
    const aTime = getComponentValue(MatchConfig, a)?.startTime ?? 0n;
    const bTime = getComponentValue(MatchConfig, b)?.startTime ?? 0n;
    return Number(bTime - aTime);
  });

  // have to work on this
  const [players, setPlayers] = useState<PlayerRate[]>([]);

  useEffect(() => {
    setPlayers(player_ratings as PlayerRate[]);  // ローカルの JSON データを使用
  }, []);

  // useEffect(() => {
  //   async function fetchRecordsAsync() {
  //     // const { records } = await fetchRecords([config.tables.MatchData]); // have to change
  //     console.log("fetchRecordsAsync");
  //   }
  //   fetchRecordsAsync();
  // }, []);

  // const allPlayers = []; 
  // console.log("allMatches.length: ", allMatches.length);

  // allMatches.forEach((match) => {
  //   const matchConfig = getComponentValue(MatchConfig, match);
  //   console.log("match: ", match);
  //   console.log("matchConfig: ", matchConfig);

  //   const createdBy = matchConfig.createdBy as Hex;
    
  //   const playerName = getComponentValue(Name, createdBy)?.value ?? createdBy;
  //   console.log("playername ", playerName);

  //   const matchRankings = getComponentValue(MatchRanking, match)?.value ?? [];
  //   console.log("matchRankings: ", matchRankings);

  //   allPlayers.push(playerName);
  // });

  // console.log("allPlayers: ", allPlayers);

  const liveMatches = useEntityQuery([HasValue(MatchJoinable, { value: false }), Has(MatchConfig), Not(MatchFinished)]);
  const oneHour = 60n * 60n;
  const sortedLiveMatches = useMemo(() => {
    return liveMatches
      .filter((matchEntity) => {
        return (
          (getComponentValue(MatchConfig, matchEntity)?.startTime ?? 0n) + oneHour >
          BigInt(Math.floor(Date.now() / 1000))
        );
      })
      .sort((a, b) => {
        const aConfig = getComponentValue(MatchConfig, a);
        const bConfig = getComponentValue(MatchConfig, b);

        return Number((bConfig?.startTime ?? 0n) - (aConfig?.startTime ?? 0n));
      });
  }, [MatchConfig, liveMatches, oneHour]);

  const { externalWalletClient } = useAmalgema();

  const { openConnectModal } = useConnectModal();

  const { setModalOpen, modal: summonIslandModal } = useSummonIslandModal();

  const tabButton = (tab: Tabs, text: string, count: number) => {
    return (
      <button
        onClick={() => setCurrentTab(tab)}
        className={twMerge(
          "text-ss-text-light h-full text-lg w-1/3",
          currentTab === tab ? "bg-ss-gold text-ss-text-default" : "hover:bg-ss-gold hover:text-ss-text-default",
        )}
      >
        {text} <span className="text-ss-text-default">({count ?? "0"})</span>
      </button>
    );
  };

  return (
    <div className="grow flex flex-col p-0">
      <div className="flex w-full">
        <Card primary={false} className="w-1/2 p-0 flex">
          {tabButton(Tabs.Play, "Play", joinableMatches.length)}

          {tabButton(Tabs.Spectate, "Spectate", sortedLiveMatches.length)}

          {tabButton(Tabs.Historical, "History", historicalMatches.length)}

          {tabButton(Tabs.Rankings, "Rankings", players.length )}
        </Card>

        <div className="grow" />

        <Button
          buttonType="primary"
          size="lg"
          onClick={() => {
            if (!externalWalletClient) {
              if (openConnectModal) openConnectModal();
              return;
            }

            setModalOpen(true);
          }}
        >
          <div className="flex flex-row items-center justify-center h-fit">
            <Plus /> <div className="w-4" /> <span>create match</span>
          </div>
        </Button>

        {summonIslandModal}
      </div>

      <div className="h-6 shrink-0" />

      <Card className="grow flex flex-col w-full p-0">
        {currentTab === Tabs.Play && <OpenMatches matches={joinableMatches} />}
        {currentTab === Tabs.Spectate && <SpectateMatches matches={sortedLiveMatches} />}
        {currentTab === Tabs.Historical && <HistoricalMatches matches={historicalMatches} />}
        {/* {currentTab === Tabs.Rankings && <PlayerRankings matches={historicalMatches} />} */}
        {currentTab === Tabs.Rankings && <PlayerRankings players={players} />} 
      </Card>
    </div>
  );
}
