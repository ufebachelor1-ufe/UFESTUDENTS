import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ypjnsfqpyszcnzibfitt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwam5zZnFweXN6Y256aWJmaXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDEwOTksImV4cCI6MjA5MDQxNzA5OX0.pgAeHjBORTcAYzQv1i8JJGDWq6-a8zaGAzQ0AXWVwbc";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
);
