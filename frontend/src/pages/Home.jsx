import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import '../pages/Home.css'

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If not logged in yet, send the user to login first before creating/joining.
  function goTo(path) {
    navigate(user ? path : "/login");
  }

  return (
    <div className="page">
      <Navbar />

      <main className="hero-section">

       
        <section className="hero-content">

          <h1>
            Watch YouTube
            <br />
            Together,{" "}
            <span>Anywhere</span>
          </h1>

          <p className="hero-description">
            Create or join a watch party, sync your favorite YouTube
            videos in real time, and enjoy with friends.
          </p>


         
          <div className="hero-buttons">

            <button
              className="create-room-btn"
              onClick={() => goTo("/create-room")}
            >
              <span className="plus-icon">+</span>
              Create a Room
            </button>

            <button
              className="join-room-btn"
              onClick={() => goTo("/join-room")}
            >
              <span className="people-icon">♧</span>
              Join a Room
            </button>

          </div>

        </section>


        
        <section className="hero-illustration">

          <div className="illustration-background">

            <div className="monitor">

              <div className="monitor-screen">

                <div className="youtube-play">
                  ▶
                </div>

              </div>

              <div className="monitor-stand"></div>

            </div>


          
            <div className="people-group">

              <div className="person person-blue">
                <div className="person-head"></div>
                <div className="person-body"></div>
              </div>

              <div className="person person-red">
                <div className="person-head"></div>
                <div className="person-body"></div>
              </div>

              <div className="person person-yellow">
                <div className="person-head"></div>
                <div className="person-body"></div>
              </div>

            </div>


            {/* CHAT ICONS */}
            <div className="chat-icon chat-one">
              👤
            </div>

            <div className="chat-icon chat-two">
              👤
            </div>

            <div className="chat-icon chat-three">
              👤
            </div>

            {/* PLANT */}
            <div className="plant">
              🌿
            </div>

          </div>

        </section>

      </main>


      
      <section className="features">

       
        <div className="feature-card">

          <div className="feature-icon">
            ⚡
          </div>

          <div>
            <h3>Real-time Sync</h3>

            <p>
              Play, pause, seek together
            </p>
          </div>

        </div>


        
        <div className="feature-card">

          <div className="feature-icon">
            👥
          </div>

          <div>
            <h3>Watch with Friends</h3>
            <p>
              Create or join rooms
            </p>
          </div>

        </div>


     
        <div className="feature-card">

          <div className="feature-icon">
            🛡
          </div>

          <div>
            <h3>Role Based Access</h3>

            <p>
              Host, Moderator, Participant
            </p>
          </div>

        </div>

      </section>
    </div>
  );
}
