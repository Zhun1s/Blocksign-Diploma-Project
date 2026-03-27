// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NDAAccess {
    struct NDARecord {
        string ndaHash;
        uint256 timestamp;
        uint256 userId;
    }

    address public owner;

    // projectId => userId => NDA record
    mapping(uint256 => mapping(uint256 => NDARecord)) public ndaRecords;

    // projectId => list of all signer userIds
    mapping(uint256 => uint256[]) public projectSigners;

    event NDASigned(
        uint256 indexed projectId,
        uint256 indexed userId,
        string ndaHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Store NDA hash on-chain for a project (relayer pattern)
    /// @param projectId The project ID
    /// @param userId The user ID who signed the NDA
    /// @param ndaHash SHA-256 hash of (NDA document + signature + timestamp)
    function signNDA(uint256 projectId, uint256 userId, string calldata ndaHash) external onlyOwner {
        require(bytes(ndaHash).length > 0, "Empty hash");
        require(
            bytes(ndaRecords[projectId][userId].ndaHash).length == 0,
            "Already signed"
        );

        ndaRecords[projectId][userId] = NDARecord({
            ndaHash: ndaHash,
            timestamp: block.timestamp,
            userId: userId
        });

        projectSigners[projectId].push(userId);

        emit NDASigned(projectId, userId, ndaHash, block.timestamp);
    }

    /// @notice Get NDA hash for a specific user in a project
    function getNDAHash(
        uint256 projectId,
        uint256 userId
    ) external view returns (string memory) {
        return ndaRecords[projectId][userId].ndaHash;
    }

    /// @notice Get full NDA record
    function getNDARecord(
        uint256 projectId,
        uint256 userId
    ) external view returns (string memory ndaHash, uint256 timestamp, uint256 _userId) {
        NDARecord memory record = ndaRecords[projectId][userId];
        return (record.ndaHash, record.timestamp, record.userId);
    }

    /// @notice Get number of signers for a project
    function getSignerCount(uint256 projectId) external view returns (uint256) {
        return projectSigners[projectId].length;
    }
}
