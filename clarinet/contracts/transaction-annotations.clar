;; title: transaction-annotations

(define-constant MAX-NOTE-LENGTH u280)
(define-constant ERR-NOTE-EMPTY (err u100))
(define-constant ERR-NOTE-NOT-FOUND (err u404))

(define-map notes
  { owner: principal, txid: (buff 32) }
  { note: (string-utf8 280) }
)

(define-public (set-note (txid (buff 32)) (note (string-utf8 280)))
  (begin
    (asserts! (> (len note) u0) ERR-NOTE-EMPTY)
    (map-set notes
      { owner: tx-sender, txid: txid }
      { note: note })
    (ok true))
)

(define-public (clear-note (txid (buff 32)))
  (match (map-get? notes { owner: tx-sender, txid: txid })
    note-data
      (begin
        (map-delete notes { owner: tx-sender, txid: txid })
        (ok true))
    ERR-NOTE-NOT-FOUND)
)

(define-read-only (get-note (owner principal) (txid (buff 32)))
  (map-get? notes { owner: owner, txid: txid })
)

(define-read-only (get-max-note-length)
  MAX-NOTE-LENGTH
)

