import { parseAbiItem, createPublicClient, http, parseAbi } from "viem"

import {mainnet} from "viem/chains"

const abi = parseAbi(["event Transfer(address indexed from,address indexed to,uint256 value)"]);

// 创建RPC客户端
const client = createPublicClient({
    chain: mainnet,
    transport: http("https://rpc.particle.network/evm-chain?chainId=1&projectUuid=25d4aff6-fab2-42f5-b3dd-94af2fc23c26&projectKey=cVEFoyJobVXjoSZwq13n9Y4y0d5YVTKFgKvaO31I")
})


async function main() {
    // 定义每次采集区块数量
    const blocks = BigInt(100);
    var current = await client.getBlockNumber();
    var start = current  - blocks;
    var end = current;
    for (;;) {
        // 如果当前区块高度没有超过最大要采集区块数量,则不采集，直到超过最大要采集区块数量
        if (current < end ) {
            current = await client.getBlockNumber();
            continue;
        }

        // 创建链上事件过滤器
        const filter = await client.createEventFilter({
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC合约地址
            event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'), 
            fromBlock: start, // 从哪一个区块开始
            toBlock: end, // 采集到哪一个区块
        });

        // 获取过滤器日志
        const logs = await client.getFilterLogs({ filter });
        // 遍历日志
        logs.forEach((log) => {
            console.log(`从 ${log.args[0]} 转账给 ${log.args[1]} ${log.args[2]! / BigInt(1e6)}USDC, 交易ID:${log.transactionHash}` )
        });

        // 获取最新区块和更新开始区块和结束区块
        current = await client.getBlockNumber();
        start = end + BigInt(1);
        end = start + blocks;
        console.log(current, start, end)
    }
}

main().catch((err) => console.log(err));