import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  { path: "/projects", file: "routes/projects.tsx" },
  { path: "/project/:id", file: "routes/project.$id.tsx" },
  { path: "*", file: "routes/404.tsx" },
] satisfies RouteConfig;
