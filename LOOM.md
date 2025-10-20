# Loom Video Scripts - STX Staking Implementation Code Walkthrough (2 Minutes Each)

## 🎬 Video 1: Smart Contract Architecture & Error Handling (2 minutes)

### **Title:** "Why I Built STX Staking This Way - Smart Contract Deep Dive"

### **Script:**

**[0:00 - 0:20] Hook & Key Change**

> "Here's the critical code change I made - using `as-contract tx-sender` for unstaking. Without this, STX stays in user wallets instead of being held by the contract."
>
> _[Show staking.clar line 32: `try! (as-contract (stx-transfer? amount tx-sender staker))`]_

**[0:20 - 1:00] Error Handling**

> "I added specific error constants instead of generic failures. This assertion prevents unstaking more than staked and gives clear frontend feedback."
>
> _[Show: `asserts! (>= current-staked amount) ERR-NO-STAKED-TOKENS`]_

**[1:00 - 1:40] Security Testing**

> "This test caught a security bug - wallet2 trying to unstake wallet1's tokens. The contract correctly returns error 102."
>
> _[Show test expecting error 102]_

**[1:40 - 2:00] Wrap-up**

> "as-contract pattern, specific errors, security tests - these choices prevented production bugs."

---

## 🎬 Video 2: Frontend Integration & Mock Data Strategy (2 minutes)

### **Title:** "Smart Frontend Integration - Mock Data to Live Blockchain"

### **Script:**

**[0:00 - 0:30] Mock Data Strategy**

> "Here's how I solved development without deployed contracts - try-catch with mock fallbacks. When blockchain calls fail, return fake data so I could build UI first."
>
> _[Show getStakedBalance catch block returning mock data]_

**[0:30 - 1:00] Hook Architecture**

> "The useStaking hook abstracts all blockchain logic. Components never know if they're using mock or real data - clean separation."
>
> _[Show fetchStakingData calling contract functions]_

**[1:00 - 1:40] SSR Solution**

> "Dynamic imports solved Next.js SSR issues with @stacks/connect. The onFinish callback refreshes data after transactions."
>
> _[Show dynamic import and onFinish callback]_

**[1:40 - 2:00] Result**

> "Mock fallbacks, clean hooks, dynamic imports - parallel development of UI and contracts."

---

## 🎬 Video 3: Testing Strategy & Bug Prevention (2 minutes)

### **Title:** "How My Test Suite Caught Critical Staking Bugs"

### **Script:**

**[0:00 - 0:40] Security Bug Caught**

> "This test caught a critical bug - wallet2 trying to unstake wallet1's tokens. Contract correctly returns error 102, preventing theft."
>
> _[Show test: wallet2 unstaking wallet1's tokens, expecting error]_

**[0:40 - 1:20] Edge Case Prevention**

> "This test validates my assertion logic - trying to unstake 2 STX when only 1 is staked. Proper error handling prevents user confusion."
>
> _[Show test expecting ERR-NO-STAKED-TOKENS]_

**[1:20 - 1:50] State Management**

> "Partial unstaking test: stake 2, unstake 0.5, verify 1.5 remains. This caught balance calculation bugs."
>
> _[Show test sequence and final assertion]_

**[1:50 - 2:00] Impact**

> "Security, edge cases, state management - comprehensive testing prevented production bugs."

---

## 🎬 Video 4: UI State Management & Tab Architecture (2 minutes)

### **Title:** "Building the Staking UI - Tab System & State Management"

### **Script:**

**[0:00 - 0:40] Tab System**

> "I added tabs to the existing address page - activeTab state with conditional rendering. Users need both transaction history and staking data for the same address."
>
> _[Show activeTab state and tab navigation]_

**[0:40 - 1:20] Component Separation**

> "Key decision: StakingTab is separate from page routing. Clean separation of concerns - staking components get data through useStaking hook."
>
> _[Show StakingTab import and conditional rendering]_

**[1:20 - 1:50] State Sync**

> "Tricky part: keeping data in sync. The onFinish callback refreshes staking data after successful transactions."
>
> _[Show onFinish calling fetchStakingData]_

**[1:50 - 2:00] Result**

> "Tab architecture, component separation, auto-sync - robust and maintainable staking feature."

---

## 📋 Recording Tips & Code Focus

### **Pre-Recording Checklist:**

- [ ] Have specific code files open and ready
- [ ] Prepare line numbers for key code sections
- [ ] Test screen recording with code visibility
- [ ] Practice explaining technical decisions
- [ ] Have terminal ready with relevant commands
- [ ] Prepare before/after code comparisons

### **Code Walkthrough Focus:**

- **Show specific lines of code, not just file overviews**
- **Explain WHY you made each technical decision**
- **Highlight the problems each code change solves**
- **Demonstrate understanding through technical details**
- **Connect code changes to real-world outcomes**

### **Key Code Sections to Highlight:**

1. **Smart Contract (staking.clar):**

   - Lines 28-33: `as-contract` pattern explanation
   - Lines 11-14: Error constant strategy
   - Lines 20-25: Input validation logic

2. **Frontend Integration (staking-contract.ts):**

   - Lines 85-95: Mock data fallback pattern
   - Lines 45-55: Error handling in blockchain calls
   - Network configuration logic

3. **State Management (use-staking.ts):**

   - Lines 65-85: Dynamic import pattern for SSR
   - Lines 120-130: Transaction callback handling
   - State synchronization after transactions

4. **Testing (staking_test.ts):**
   - Security test: Lines 45-60
   - Edge case test: Lines 25-40
   - State management test: Lines 15-25

### **Technical Explanation Framework:**

For each code section:

1. **What** - Show the specific code
2. **Why** - Explain the technical reasoning
3. **How** - Demonstrate the implementation
4. **Impact** - Show what problem it solves

### **Description Template:**

```
🔧 Code walkthrough of my STX staking implementation for LearnWeb3

⏰ Timestamps:
0:00 Smart contract architecture decisions
0:30 Error handling strategy
1:00 Frontend integration challenges
1:30 Testing approach that caught bugs

💻 Key Technical Decisions Explained:
- Why I used as-contract pattern for STX transfers
- How mock data fallbacks enabled parallel development
- Why specific error constants improve UX
- How dynamic imports solved SSR issues

🔗 Repository: [GitHub link]

#LearnWeb3 #Stacks #Clarity #SmartContracts #CodeWalkthrough
```

### **Focus on Technical Understanding:**

- Explain the reasoning behind each architectural choice
- Show how specific code patterns solve real problems
- Demonstrate understanding of blockchain development challenges
- Connect implementation details to user experience outcomes
- Highlight testing strategies that prevented bugs
