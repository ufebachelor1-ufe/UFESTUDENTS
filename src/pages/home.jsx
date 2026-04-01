import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./home.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setPosts(data || []);
      }

      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  return (
    <div className="home-container">
      <h1>Latest News</h1>

      <div className="posts-grid">
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <img src={post.image_url} alt={post.title} />
            <h3>{post.title}</h3>

            <div
              className="post-description"
              dangerouslySetInnerHTML={{ __html: post.description }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
