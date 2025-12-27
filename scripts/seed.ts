/**
 * Seed Script for Ekstraklasa Tracker
 *
 * Run with: pnpm seed
 *
 * Creates:
 * - 1 League (Ekstraklasa)
 * - 18 Teams (real 2024/2025 season)
 * - 306 Matches (34 rounds × 9 matches)
 * - Results for rounds 1-14 (random scores)
 * - 1 Admin user
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Models
import League from "../models/League";
import Team from "../models/Team";
import Match from "../models/Match";
import User from "../models/User";

// MongoDB URI from environment
const MONGODB_URI_RAW = process.env.MONGODB_URI;

if (!MONGODB_URI_RAW) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  console.error("   Create a .env.local file with MONGODB_URI=mongodb+srv://...");
  process.exit(1);
}

const MONGODB_URI: string = MONGODB_URI_RAW;

// 18 Ekstraklasa teams for 2024/2025 season (real data)
const TEAMS_DATA = [
  { name: "Jagiellonia Białystok", shortName: "JAG", slug: "jagiellonia-bialystok", stadium: "Stadion Miejski w Białymstoku", city: "Białystok" },
  { name: "Lech Poznań", shortName: "LEP", slug: "lech-poznan", stadium: "INEA Stadion", city: "Poznań" },
  { name: "Legia Warszawa", shortName: "LEG", slug: "legia-warszawa", stadium: "Stadion Wojska Polskiego", city: "Warszawa" },
  { name: "Raków Częstochowa", shortName: "RAK", slug: "rakow-czestochowa", stadium: "Stadion Miejski w Częstochowie", city: "Częstochowa" },
  { name: "Pogoń Szczecin", shortName: "POG", slug: "pogon-szczecin", stadium: "Stadion Miejski im. Floriana Krygiera", city: "Szczecin" },
  { name: "Cracovia", shortName: "CRA", slug: "cracovia", stadium: "Stadion im. Józefa Piłsudskiego", city: "Kraków" },
  { name: "Piast Gliwice", shortName: "PIA", slug: "piast-gliwice", stadium: "Stadion Miejski w Gliwicach", city: "Gliwice" },
  { name: "Śląsk Wrocław", shortName: "SLA", slug: "slask-wroclaw", stadium: "Tarczyński Arena", city: "Wrocław" },
  { name: "Stal Mielec", shortName: "STM", slug: "stal-mielec", stadium: "Stadion Miejski w Mielcu", city: "Mielec" },
  { name: "Górnik Zabrze", shortName: "GOR", slug: "gornik-zabrze", stadium: "Arena Zabrze", city: "Zabrze" },
  { name: "Widzew Łódź", shortName: "WID", slug: "widzew-lodz", stadium: "Stadion Widzewa Łódź", city: "Łódź" },
  { name: "Zagłębie Lubin", shortName: "ZAG", slug: "zaglebie-lubin", stadium: "Stadion Zagłębia Lubin", city: "Lubin" },
  { name: "Warta Poznań", shortName: "WAR", slug: "warta-poznan", stadium: "Stadion Dyskobolii", city: "Grodzisk Wielkopolski" },
  { name: "Korona Kielce", shortName: "KOR", slug: "korona-kielce", stadium: "Suzuki Arena", city: "Kielce" },
  { name: "Puszcza Niepołomice", shortName: "PUS", slug: "puszcza-niepolomice", stadium: "Stadion Miejski w Niepołomicach", city: "Niepołomice" },
  { name: "Radomiak Radom", shortName: "RAD", slug: "radomiak-radom", stadium: "Stadion MOSiR Radom", city: "Radom" },
  { name: "Ruch Chorzów", shortName: "RCH", slug: "ruch-chorzow", stadium: "Stadion Miejski w Chorzowie", city: "Chorzów" },
  { name: "GKS Katowice", shortName: "GKS", slug: "gks-katowice", stadium: "Stadion GKS Katowice", city: "Katowice" },
];

/**
 * Generate round-robin schedule
 * Each team plays against every other team twice (home and away)
 */
function generateSchedule(teamIds: mongoose.Types.ObjectId[]): { homeTeam: mongoose.Types.ObjectId; awayTeam: mongoose.Types.ObjectId; round: number }[] {
  const numTeams = teamIds.length;
  const matches: { homeTeam: mongoose.Types.ObjectId; awayTeam: mongoose.Types.ObjectId; round: number }[] = [];

  // Create a copy of teamIds for rotation
  const teams = [...teamIds];

  // First half of season (rounds 1-17)
  for (let round = 0; round < numTeams - 1; round++) {
    for (let i = 0; i < numTeams / 2; i++) {
      const home = teams[i]!;
      const away = teams[numTeams - 1 - i]!;

      // Alternate home/away for fairness
      if (round % 2 === 0) {
        matches.push({ homeTeam: home, awayTeam: away, round: round + 1 });
      } else {
        matches.push({ homeTeam: away, awayTeam: home, round: round + 1 });
      }
    }

    // Rotate teams (keep first team fixed)
    const lastTeam = teams.pop()!;
    teams.splice(1, 0, lastTeam);
  }

  // Second half of season (rounds 18-34) - reverse home/away
  const firstHalfMatches = [...matches];
  for (const match of firstHalfMatches) {
    matches.push({
      homeTeam: match.awayTeam,
      awayTeam: match.homeTeam,
      round: match.round + (numTeams - 1),
    });
  }

  return matches;
}

/**
 * Generate random score (0-5 goals)
 */
function randomScore(): number {
  const weights = [0.20, 0.30, 0.25, 0.15, 0.07, 0.03]; // Weighted towards lower scores
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]!;
    if (random <= cumulative) return i;
  }
  return 0;
}

/**
 * Generate match date for a given round
 */
function getMatchDate(round: number): Date {
  // Season starts in July 2024
  const seasonStart = new Date("2024-07-19");
  // Roughly one round per week
  const daysOffset = (round - 1) * 7 + Math.floor(Math.random() * 3);
  const matchDate = new Date(seasonStart);
  matchDate.setDate(matchDate.getDate() + daysOffset);
  return matchDate;
}

/**
 * Generate random match time
 */
function getMatchTime(): string {
  const times = ["15:00", "17:30", "18:00", "20:00", "20:30"];
  return times[Math.floor(Math.random() * times.length)]!;
}

async function seed() {
  console.log("🌱 Starting seed process...\n");

  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      League.deleteMany({}),
      Team.deleteMany({}),
      Match.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log("✅ Data cleared\n");

    // Create League
    console.log("🏆 Creating league...");
    const league = await League.create({
      name: "Ekstraklasa",
      country: "PL",
      currentSeason: "2024/2025",
      currentRound: 15,
      totalRounds: 34,
      teamsCount: 18,
    });
    console.log(`✅ League created: ${league.name}\n`);

    // Create Teams
    console.log("⚽ Creating teams...");
    const teams = await Team.insertMany(
      TEAMS_DATA.map((team) => ({
        ...team,
        leagueId: league._id,
      }))
    );
    console.log(`✅ Created ${teams.length} teams\n`);

    // Generate schedule
    console.log("📅 Generating schedule (306 matches)...");
    const teamIds = teams.map((t) => t._id);
    const schedule = generateSchedule(teamIds);

    // Create matches with results for rounds 1-14
    const matchesData = schedule.map((match) => {
      const isFinished = match.round <= 14;
      const homeTeam = teams.find((t) => t._id.equals(match.homeTeam))!;

      return {
        leagueId: league._id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: isFinished ? randomScore() : null,
        awayScore: isFinished ? randomScore() : null,
        round: match.round,
        season: "2024/2025",
        date: getMatchDate(match.round),
        time: getMatchTime(),
        stadium: homeTeam.stadium,
        status: isFinished ? "FINISHED" : "SCHEDULED",
      };
    });

    await Match.insertMany(matchesData);

    const finishedMatches = matchesData.filter((m) => m.status === "FINISHED").length;
    const scheduledMatches = matchesData.filter((m) => m.status === "SCHEDULED").length;
    console.log(`✅ Created ${matchesData.length} matches`);
    console.log(`   - Finished: ${finishedMatches} (rounds 1-14)`);
    console.log(`   - Scheduled: ${scheduledMatches} (rounds 15-34)\n`);

    // Create Admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const admin = await User.create({
      email: "admin@ekstraklasa.pl",
      password: hashedPassword,
      name: "Administrator",
      role: "ADMIN",
    });
    console.log(`✅ Admin created: ${admin.email}\n`);

    // Summary
    console.log("═".repeat(50));
    console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
    console.log("═".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`   - League: ${league.name} (${league.currentSeason})`);
    console.log(`   - Current Round: ${league.currentRound}`);
    console.log(`   - Teams: ${teams.length}`);
    console.log(`   - Matches: ${matchesData.length}`);
    console.log(`   - Finished matches: ${finishedMatches}`);
    console.log(`   - Admin: ${admin.email} / admin123`);
    console.log("\n🚀 You can now start the app with: pnpm dev\n");

  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
}

// Run seed
seed();
