// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import "./MyERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenBank {
    mapping(address => uint256) deposits;

    address public erc20token;

    constructor(address addr_) {
        erc20token = addr_;
    }

   
    function withdraw(uint256 amount) public {
        IERC20(erc20token).transfer(msg.sender, amount);
        deposits[msg.sender] -= amount;
    }

    // 添加一个函数 permitDeposit 以支持离线签名授权（permit）进行存款

    function permitDeposit(
        address owner,
        address spender,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        IERC20Permit(erc20token).permit(owner, spender, amount, deadline, v, r, s);
        IERC20(erc20token).transferFrom(owner, address(this), amount);
        deposits[owner] += amount;
    }

    function balanceOf(address user) public view returns (uint256) {
        return deposits[user];
    }
}