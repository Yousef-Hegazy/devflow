import { APIType } from "@/app/api/[[...route]]/route";
import { hc } from "hono/client";

export const client = hc<APIType>("http://localhost:3000")