(define-map categories
  { owner: principal, txid: (buff 32) }
  { category: (string-utf8 32) }
)

(define-read-only (get-category (owner principal) (txid (buff 32)))
  (map-get? categories { owner: owner, txid: txid })
)

(define-public (set-category (txid (buff 32)) (category (string-utf8 32)))
  (begin
    (map-set categories { owner: tx-sender, txid: txid } { category: category })
    (ok true)
  )
)
