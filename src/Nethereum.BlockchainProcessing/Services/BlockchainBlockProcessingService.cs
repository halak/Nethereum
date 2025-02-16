using System;
#if false && (NETSTANDARD2_0_OR_GREATER || NETCOREAPP3_1_OR_GREATER || NET461_OR_GREATER || NET5_0_OR_GREATER)
using Microsoft.Extensions.Logging;
#else
using Nethereum.JsonRpc.Client;
#endif
using Nethereum.BlockchainProcessing.BlockProcessing;
using Nethereum.BlockchainProcessing.BlockStorage;
using Nethereum.BlockchainProcessing.BlockStorage.Repositories;
using Nethereum.BlockchainProcessing.ProgressRepositories;
using Nethereum.Contracts.Services;
using Nethereum.RPC.Eth.Blocks;

namespace Nethereum.BlockchainProcessing.Services
{
    public class BlockchainBlockProcessingService : IBlockchainBlockProcessingService
    {
        private readonly IEthApiContractService _ethApiContractService;

        public BlockchainBlockProcessingService(IEthApiContractService ethApiContractService)
        {
            _ethApiContractService = ethApiContractService;
        }

#if !DOTNET35

        public BlockchainCrawlingProcessor CreateBlockProcessor(
            Action<BlockProcessingSteps> stepsConfiguration, 
            uint minimumBlockConfirmations, 
            ILogger log = null) => CreateBlockProcessor(
                new InMemoryBlockchainProgressRepository(),
                stepsConfiguration, 
                minimumBlockConfirmations, 
                log);

        public BlockchainCrawlingProcessor CreateBlockProcessor(
            IBlockProgressRepository blockProgressRepository,
            Action<BlockProcessingSteps> stepsConfiguration,
            uint minimumBlockConfirmations,
            ILogger log = null)
        {
            var processingSteps = new BlockProcessingSteps();
            var orchestrator = new BlockCrawlOrchestrator(_ethApiContractService, processingSteps );
            var lastConfirmedBlockNumberService = new LastConfirmedBlockNumberService(_ethApiContractService.Blocks.GetBlockNumber, minimumBlockConfirmations);

            stepsConfiguration?.Invoke(processingSteps);

            return new BlockchainCrawlingProcessor(orchestrator, blockProgressRepository, lastConfirmedBlockNumberService, log);
        }

        public BlockchainCrawlingProcessor CreateBlockStorageProcessor(
            IBlockchainStoreRepositoryFactory blockchainStorageFactory, 
            uint minimumBlockConfirmations, 
            Action<BlockProcessingSteps> configureSteps = null,
            ILogger log = null) => CreateBlockStorageProcessor(
                blockchainStorageFactory, 
                null, 
                minimumBlockConfirmations, 
                configureSteps, 
                log);


        public BlockchainCrawlingProcessor CreateBlockStorageProcessor(
            IBlockchainStoreRepositoryFactory blockchainStorageFactory,
            IBlockProgressRepository blockProgressRepository,
            uint minimumBlockConfirmations,
            Action<BlockProcessingSteps> configureSteps = null,
            ILogger log = null)
        {
            var processingSteps = new BlockStorageProcessingSteps(blockchainStorageFactory);
            var orchestrator = new BlockCrawlOrchestrator(_ethApiContractService, processingSteps);

            if (blockProgressRepository == null && blockchainStorageFactory is IBlockProgressRepositoryFactory progressRepoFactory)
            {
                blockProgressRepository = progressRepoFactory.CreateBlockProgressRepository();
            }

            blockProgressRepository = blockProgressRepository ?? new InMemoryBlockchainProgressRepository();
            var lastConfirmedBlockNumberService = new LastConfirmedBlockNumberService(_ethApiContractService.Blocks.GetBlockNumber, minimumBlockConfirmations);

            configureSteps?.Invoke(processingSteps);

            return new BlockchainCrawlingProcessor(orchestrator, blockProgressRepository, lastConfirmedBlockNumberService, log);

        }

#endif
    }
}