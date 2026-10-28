import { createApp } from "../server/app";

const { app } = createApp({ serveStatic: false });

export default app;

