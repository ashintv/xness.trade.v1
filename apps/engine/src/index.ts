
import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import { TODO } from "@repo/types/types";



class Engine {
	private client: RedisClientType;
    private latest_prices:TODO = null
	constructor() {
		this.client = redisClient
        this.startEngine()
	}
    async startEngine(){
        await this.client.connect()
        await this.client.subscribe("backpack" ,(message)=>{
            this.latest_prices = JSON.parse(message as string)
            console.log(this.latest_prices)
        });
    }
}

const engine = new Engine()