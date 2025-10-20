;; STX Staking Contract 
;; Allows users to stake and unstake STX tokens

;; Data maps
(define-map staked-balances principal uint)
(define-map staking-history principal (list 100 {amount: uint, block-height: uint, action: (string-ascii 10)}))

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-NO-STAKED-TOKENS (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))

;; Public functions

;; Stake STX tokens
(define-public (stake (amount uint))
  (let ((staker tx-sender)
        (current-staked (default-to u0 (map-get? staked-balances staker))))
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (stx-transfer? amount staker (as-contract tx-sender)))
    (map-set staked-balances staker (+ current-staked amount))
    (ok amount)))

;; Unstake STX tokens
(define-public (unstake (amount uint))
  (let ((staker tx-sender)
        (current-staked (default-to u0 (map-get? staked-balances staker))))
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (>= current-staked amount) ERR-NO-STAKED-TOKENS)     
    (try! (as-contract (stx-transfer? amount tx-sender staker)))
    (map-set staked-balances staker (- current-staked amount))
    (ok amount)))

;; Unstake all tokens
(define-public (unstake-all)
  (let ((staker tx-sender)
        (staked-amount (default-to u0 (map-get? staked-balances staker))))
    (asserts! (> staked-amount u0) ERR-NO-STAKED-TOKENS)
    (try! (as-contract (stx-transfer? staked-amount tx-sender staker)))
    (map-delete staked-balances staker)
    (ok staked-amount)))

;; Read-only functions

;; Get staked balance for a user
(define-read-only (get-stake (user principal))
  (default-to u0 (map-get? staked-balances user)))

;; Get total staked in contract
(define-read-only (get-total-staked)
  (stx-get-balance (as-contract tx-sender)))