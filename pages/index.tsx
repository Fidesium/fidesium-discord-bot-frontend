import { useAddress, useUser } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import SignIn from "../components/SignIn";
import styles from "../styles/Home.module.css";
import { useSearchParams } from 'next/navigation'

const Home: NextPage = () => {
  const address = useAddress();
  const { data: session } = useSession();
  const { isLoggedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchParams = useSearchParams()
  const guild_id = searchParams.get('guild_id')
  const role_id = searchParams.get('role_id')

  const requestGrantRole = async () => {
    // Then make a request to our API endpoint.
    try {
      setLoading(true);
      const response = await fetch(`/api/grant-role?discordServerId=${guild_id}&roleId=${role_id}`, {
        method: "POST",
      });
      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.container} style={{ marginTop: 0 }}>
        <SignIn />

        {address && isLoggedIn && session && (
          <div className={styles.collectionContainer}>
            <button className={styles.mainButton} onClick={requestGrantRole}>
              {loading ? "Loading..." : "Give me the role"}
            </button>
          </div>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Home;