import React from "react";
import { PixelCat } from "../utils/pixelArt";
import JaguarJack from "./JaguarJack";
import "./styles/TutorialPage.css";

export default function TutorialPage() {
  return (
    <div className="tutorial-page">
      <div className="tutorial-container">
        {/* Welcome Section */}
        <section className="tutorial-section welcome-section">
          <div className="jack-intro">
            <div className="jack-character">
              <JaguarJack />
            </div>
            <div className="speech-bubble">
              <h1>Hey there! I'm Jack the Jaguar! 🐾</h1>
              <p>
                Welcome to Clio Pets, the most paw-some virtual pet game around!
                I'm here to show you the ropes and help you become the best pet
                parent ever. Let's dive in!
              </p>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>🌟 Getting Started</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              First things first - you'll want to create your very own pet! Click
              the "Add Your First Pet" button on your home page to get started.
            </p>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/home-add-pet.png"
                alt="Home Page with Add Pet Button"
                className="tutorial-screenshot"
              />
            </div>
            <p>
              You'll get to choose from awesome species like Dogs, Cats, Birds,
              Bunnies, Lizards, and even Owls! Pick your favorite color too -
              make your pet uniquely yours!
            </p>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/add-pet-modal.png"
                alt="Add Pet Modal with species and color options"
                className="tutorial-screenshot"
              />
            </div>
          </div>
        </section>

        {/* Core Stats */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>📊 Understanding Your Pet's Stats</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              Every pet has four vital stats that you need to keep an eye on.
              Think of them as your pet's health bars!
            </p>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🍖</span>
                <h3>Fullness</h3>
                <p>How hungry your pet is. Keep them well-fed!</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">😊</span>
                <h3>Happiness</h3>
                <p>Your pet's mood. Happy pets are the best pets!</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✨</span>
                <h3>Cleanliness</h3>
                <p>How clean your pet is. Nobody likes a dirty pet!</p>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⚡</span>
                <h3>Energy</h3>
                <p>Your pet's stamina. Rest is important!</p>
              </div>
            </div>
            <div className="tip-box">
              <strong>Jack's Tip:</strong> All stats start at 50 and range from
              0-100. Try to keep them balanced!
            </div>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/pet-stats-display.png"
                alt="Pet stats display showing all four stat bars"
                className="tutorial-screenshot"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>🎯 Taking Care of Your Pet</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              You can interact with your pet using seven different actions. Each
              action affects your pet's stats and earns you XP!
            </p>
            <div className="actions-grid">
              <div className="action-card">
                <span className="action-icon">🍖</span>
                <h3>Feed</h3>
                <p className="action-effect">Fullness +20</p>
                <p className="action-xp">+5 XP</p>
              </div>
              <div className="action-card">
                <span className="action-icon">🎾</span>
                <h3>Play</h3>
                <p className="action-effect">Happiness +20, Energy -10</p>
                <p className="action-xp">+10 XP</p>
              </div>
              <div className="action-card">
                <span className="action-icon">🛁</span>
                <h3>Clean</h3>
                <p className="action-effect">Cleanliness +25</p>
                <p className="action-xp">+5 XP</p>
              </div>
              <div className="action-card">
                <span className="action-icon">😴</span>
                <h3>Rest</h3>
                <p className="action-effect">Energy +30</p>
                <p className="action-xp">+5 XP</p>
              </div>
              <div className="action-card">
                <span className="action-icon">🏃</span>
                <h3>Exercise</h3>
                <p className="action-effect">
                  Happiness +10, Energy -15, Fullness -10
                </p>
                <p className="action-xp">+15 XP (Best!)</p>
              </div>
              <div className="action-card">
                <span className="action-icon">🦴</span>
                <h3>Treat</h3>
                <p className="action-effect">Fullness +10, Happiness +15</p>
                <p className="action-xp">+5 XP</p>
              </div>
              <div className="action-card">
                <span className="action-icon">💻</span>
                <h3>Work</h3>
                <p className="action-effect">Energy -20</p>
                <p className="action-xp">+10 XP + 5-20 Coins</p>
                <p className="action-note">Teens & Adults only!</p>
              </div>
            </div>
            <div className="tip-box">
              <strong>Jack's Tip:</strong> There's a 10-minute cooldown between
              actions (but you can reduce it with streaks and sharing!)
            </div>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/action-buttons.png"
                alt="Action buttons in pet details modal"
                className="tutorial-screenshot"
              />
            </div>
          </div>
        </section>

        {/* XP & Stages */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>⭐ Growing Up: XP & Evolution</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              As you care for your pet, they'll earn XP and evolve through three
              life stages. Watch them grow from a tiny baby to a majestic adult!
            </p>
            <div className="stages-grid">
              <div className="stage-card">
                <div className="stage-pet">
                  <PixelCat stage={1} />
                </div>
                <h3>🍼 Baby</h3>
                <p>0-199 XP</p>
                <p className="stage-desc">Adorable and tiny!</p>
              </div>
              <div className="stage-arrow">→</div>
              <div className="stage-card">
                <div className="stage-pet">
                  <PixelCat stage={2} />
                </div>
                <h3>🎒 Teen</h3>
                <p>200-599 XP</p>
                <p className="stage-desc">Growing strong! Can work for coins.</p>
              </div>
              <div className="stage-arrow">→</div>
              <div className="stage-card">
                <div className="stage-pet">
                  <PixelCat stage={3} />
                </div>
                <h3>👑 Adult</h3>
                <p>600+ XP</p>
                <p className="stage-desc">Fully grown and magnificent!</p>
              </div>
            </div>
            <div className="tip-box">
              <strong>Jack's Tip:</strong> XP never decays, so your pet will
              always keep growing!
            </div>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/pet-evolution.png"
                alt="Pet evolution stages or XP progress bar"
                className="tutorial-screenshot"
              />
            </div>
          </div>
        </section>

        {/* Age System */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>🎂 The Age System</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              Your pet also has a real-time age that grows as you care for them.
              If you keep at least 3 out of 4 stats above 45, your pet will age 1
              month per real-life day!
            </p>
            <div className="info-box">
              <h3>How Aging Works:</h3>
              <ul>
                <li>Stats decay by 5 points per day when you're away</li>
                <li>
                  If 3+ stats are ≥45 after decay, your pet ages 1 month per day
                </li>
                <li>
                  This is the "Schrödinger's Pet" mechanic - decay only happens
                  when you return!
                </li>
                <li>Keep your pet well-cared for to watch them grow old</li>
              </ul>
            </div>
            <div className="tip-box">
              <strong>Jack's Tip:</strong> Don't worry about checking in every
              hour - the game is designed to be casual and forgiving!
            </div>
          </div>
        </section>

        {/* Streaks */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>🔥 Daily Streaks & Cooldown Reduction</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              The more consecutive days you interact with your pet, the shorter
              your cooldown becomes! Build up your streak to unlock amazing
              bonuses.
            </p>
            <div className="streak-tiers">
              <div className="tier-card">
                <span className="tier-emoji">🔥</span>
                <h3>Common (3-6 days)</h3>
                <p>8 min cooldown (-2 min)</p>
              </div>
              <div className="tier-card">
                <span className="tier-emoji">🌟</span>
                <h3>Uncommon (7-13 days)</h3>
                <p>6 min cooldown (-4 min)</p>
              </div>
              <div className="tier-card">
                <span className="tier-emoji">⭐</span>
                <h3>Rare (14-29 days)</h3>
                <p>4 min cooldown (-6 min)</p>
              </div>
              <div className="tier-card">
                <span className="tier-emoji">💎</span>
                <h3>Epic (30-59 days)</h3>
                <p>2 min cooldown (-8 min)</p>
              </div>
              <div className="tier-card legendary">
                <span className="tier-emoji">🏆</span>
                <h3>Legendary (60+ days)</h3>
                <p>NO COOLDOWN! (-10 min)</p>
              </div>
            </div>
            <div className="tip-box">
              <strong>Jack's Tip:</strong> Miss a day and your streak resets to 1.
              Stay consistent to reach legendary status!
            </div>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/streak-display.png"
                alt="Streak counter and tier badge display"
                className="tutorial-screenshot"
              />
            </div>
          </div>
        </section>

        {/* Sharing & Community */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>🌍 Sharing & Community</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              Want to show off your pet to the world? Enable sharing to let
              others interact with your pet! The more people who interact, the
              shorter your cooldown becomes.
            </p>
            <div className="info-box">
              <h3>Social Interaction Bonuses:</h3>
              <ul>
                <li>
                  <strong>5-9 unique visitors:</strong> -1 min cooldown
                </li>
                <li>
                  <strong>10-19 visitors:</strong> -2 min cooldown
                </li>
                <li>
                  <strong>20-49 visitors:</strong> -3 min cooldown
                </li>
                <li>
                  <strong>50+ visitors:</strong> -5 min cooldown
                </li>
              </ul>
            </div>
            <p>
              When sharing is enabled, others can pet or give treats to your pet.
              You'll get notifications when someone interacts!
            </p>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/share-pet-modal.png"
                alt="Share Pet modal with QR code and link"
                className="tutorial-screenshot"
              />
            </div>
            <div className="tip-box">
              <strong>Jack's Tip:</strong> Check out the Community page to see all
              shared pets and interact with them!
            </div>
          </div>
        </section>

        {/* Play Dates */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>🎉 Play Dates</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              Your pet can go on play dates with other pets in the community!
              Both pets will gain stats and XP from fun activities together.
            </p>
            <div className="info-box">
              <h3>Play Date Activities Include:</h3>
              <ul>
                <li>🎾 Playing fetch together</li>
                <li>🏃 Going for a run</li>
                <li>🎨 Arts and crafts</li>
                <li>🎮 Video games</li>
                <li>🍕 Sharing snacks</li>
                <li>And many more!</li>
              </ul>
            </div>
            <div className="warning-box">
              <strong>⏰ Important:</strong> Play dates have a 24-hour cooldown.
              Choose your play date partner wisely!
            </div>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/play-date-modal.png"
                alt="Play Date modal with pet selection and activity"
                className="tutorial-screenshot"
              />
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>🏆 The Leaderboard</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              Think you've got what it takes to be the best? Check out the
              leaderboard to see how your pet stacks up against others!
            </p>
            <div className="leaderboard-categories">
              <div className="category-card">
                <span className="category-icon">⭐</span>
                <h3>Top by XP</h3>
                <p>The most experienced pets - shows dedication!</p>
              </div>
              <div className="category-card">
                <span className="category-icon">👥</span>
                <h3>Top by Interactions</h3>
                <p>The most popular pets - everyone loves them!</p>
              </div>
              <div className="category-card">
                <span className="category-icon">🌟</span>
                <h3>Featured Pets</h3>
                <p>Random awesome pets to discover!</p>
              </div>
            </div>
            <div className="screenshot-container">
              <img
                src="/tutorial-screenshots/leaderboard-page.png"
                alt="Leaderboard page with rankings and pet cards"
                className="tutorial-screenshot"
              />
            </div>
          </div>
        </section>

        {/* Coins System */}
        <section className="tutorial-section">
          <div className="section-header">
            <h2>💰 Earning Coins</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <p>
              Once your pet reaches Teen stage (200+ XP), they can work to earn
              coins! Each work action earns 5-20 coins randomly.
            </p>
            <div className="info-box">
              <h3>About Coins:</h3>
              <ul>
                <li>Earned through the Work action (💻)</li>
                <li>Only available for Teen and Adult pets</li>
                <li>Random reward: 5-20 coins per work session</li>
                <li>Costs 20 energy to work</li>
                <li>Future updates will add a coin shop!</li>
              </ul>
            </div>
            <div className="tip-box">
              <strong>Jack's Tip:</strong> Make sure your pet has enough energy
              before sending them to work!
            </div>
          </div>
        </section>

        {/* Tips & Tricks */}
        <section className="tutorial-section tips-section">
          <div className="section-header">
            <h2>💡 Jack's Pro Tips</h2>
            <div className="jack-small">
              <JaguarJack />
            </div>
          </div>
          <div className="section-content">
            <div className="tips-grid">
              <div className="tip-card">
                <span className="tip-number">1</span>
                <h3>Balance is Key</h3>
                <p>
                  Don't focus on just one stat! Keep all four stats balanced for
                  healthy aging.
                </p>
              </div>
              <div className="tip-card">
                <span className="tip-number">2</span>
                <h3>Exercise is Best</h3>
                <p>
                  The Exercise action gives the most XP (+15). Use it when your
                  pet has good energy and fullness!
                </p>
              </div>
              <div className="tip-card">
                <span className="tip-number">3</span>
                <h3>Share for Bonuses</h3>
                <p>
                  Enable sharing and share your pet link to get cooldown
                  reductions from visitors!
                </p>
              </div>
              <div className="tip-card">
                <span className="tip-number">4</span>
                <h3>Daily Consistency</h3>
                <p>
                  Check in every day to build your streak. Even one action per day
                  counts!
                </p>
              </div>
              <div className="tip-card">
                <span className="tip-number">5</span>
                <h3>Watch the Icons</h3>
                <p>
                  Your pet will show emojis (😢💤💩) when stats are low. Pay
                  attention!
                </p>
              </div>
              <div className="tip-card">
                <span className="tip-number">6</span>
                <h3>Plan Play Dates</h3>
                <p>
                  Play dates have a 24-hour cooldown, so choose pets with good
                  stats for maximum benefit!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="tutorial-section closing-section">
          <div className="jack-intro">
            <div className="jack-character">
              <JaguarJack />
            </div>
            <div className="speech-bubble">
              <h2>You're Ready! 🎉</h2>
              <p>
                That's everything you need to know to become an amazing pet
                parent! Remember, Clio Pets is all about having fun and building
                a bond with your virtual companion.
              </p>
              <p>
                Don't stress about being perfect - the game is designed to be
                casual and forgiving. Just check in when you can, show your pet
                some love, and watch them grow!
              </p>
              <p className="closing-message">
                Now get out there and start your pet journey! I believe in you! 🐾
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

