import Redis from "ioredis";

const opt: any = {}
if (process.env.REDIS_PASS) {
  opt.password = process.env.REDIS_PASS
}

const redis = new Redis(parseInt(process.env.REDIS_PORT || ""), process.env.REDIS_HOST || "", opt)

export default redis;