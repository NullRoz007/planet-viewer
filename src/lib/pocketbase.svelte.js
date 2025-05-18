import PocketBase from "pocketbase";
import { getContext, setContext } from "svelte";

export class PocketBaseInstance {
  pb = $state(new PocketBase("http://127.0.0.1:8090"));
}

const POCKETBASE_KEY = Symbol("POCKETBASE");

export function setPocketBaseInstance() {
  return setContext(POCKETBASE_KEY, new PocketBaseInstance());
}

export function getPocketBaseInstance() {
  return getContext(POCKETBASE_KEY);
}
