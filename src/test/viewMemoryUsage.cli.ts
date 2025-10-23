import { getTargetBaseUrl, targetEnv } from "@/test/targetEnv"

const response = await fetch(getTargetBaseUrl(targetEnv.localhostBun) + "/memoryUsage", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})

console.log(response)
const text = await response.text()
console.log("text", text)

// about 92 mb
