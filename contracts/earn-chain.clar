;; When entrance, member must pay a fee 1000STX
;; Invite more member to receive referral fee, which is 500 STX each accepted member

(define-constant entrance-fee u1000)
(define-constant invite-earn u500)
(define-constant schemer 'SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB)

;; u999: not invited yet, u0: invite but no response, u1: accepted, u2: rejected
(define-map invite ((sender principal) (recipient principal)) ((status uint)))
(define-map success-invite-count ((member principal)) ((count uint)))
(define-map init-deposit ((member principal)) ((amount uint)))
(define-map deposit-day-count ((member principal)) ((count uint)))
(define-map membership ((member principal)) ((status bool)))

(define-constant invite-not-exists-err (err u1))
(define-constant withdraw-err (err u2))
(define-constant cannot-invite-err (err u3))
(define-constant register-err (err u4))

(define-private (pay-entrance-fee)
  (let ((sender tx-sender))
    (as-contract (stx-transfer? entrance-fee sender tx-sender))
    (map-set init-deposit
      {member: sender}
      {amount: u1000}
    )
  )
)

(define-private (get-invite (sender principal) (recipient principal))
  (unwrap! (get status (map-get? invite {sender: sender, recipient: recipient})) u999)
)

(define-private (is-invited (sender principal) (recipient principal))
  (is-eq u0 (get-invite sender recipient))
)

(define-private (is-member (member principal))
  (unwrap! (get status (map-get? membership {member: member} )) false)
)

(define-private (init-deposit-of (member principal))
  (unwrap! (get amount (map-get? init-deposit {member: member} )) u0)
)

(define-private (deposit-day-count-of (member principal))
  (unwrap! (get count (map-get? deposit-day-count {member: member} )) u0)
)

(define-private (success-invite-count-of (member principal))
  (unwrap! (get count (map-get? success-invite-count {member: member} )) u0)
)

(define-private (balance-of (member principal))
  (let ((deposit (init-deposit-of member)) (days (deposit-day-count-of member)) (count (success-invite-count-of member)))
      (+
        ;;init deposit
        deposit
        ;;invite
        (* count invite-earn)
      )
  )
)

(define-private (can-invite (sender principal) (recipient principal))
  ;; sender must be different than recipient
  ;; sender must be a member
  ;; recipient must not be a member
  ;; recipient must not be invited by sender or got rejected by sender
  (and
    (not (is-eq sender recipient))
    (is-member sender)
    (not (is-member recipient))
    (or
      (is-eq (get-invite sender recipient) u999)
      (is-eq (get-invite sender recipient) u2)
    )
  )
)

(define-public (total-earn-of (member principal))
  (ok (balance-of member))
)

(define-public (register)
  (if (not (is-member tx-sender))
    (begin
      (pay-entrance-fee)
      (map-set membership
        {member: tx-sender}
        {status: true}
      )
      (ok true)
    )
    register-err
  )
)

(define-public (invite-new-member (new-member principal))
  (if (can-invite tx-sender new-member)
    (begin
      (map-set invite
        {sender: tx-sender, recipient: new-member}
        {status: u0}
      )
      (ok true)
    )
    cannot-invite-err
  )
)

;; accept invite from sender
(define-public (accept-invite-from (sender principal))
  (if (is-invited sender tx-sender)
    (begin
      ;; deposit STX to become member
      (pay-entrance-fee)
      ;; update status of invite
      (map-set invite
          {sender: sender, recipient: tx-sender}
          {status: u1}
      )
      ;; update success invite count of sender
      (map-set success-invite-count
          {member: sender}
          {count: (+ (success-invite-count-of sender) u1)}
      )

      ;; update membership of tx-sender
      (map-set membership
          {member: tx-sender}
          {status: true}
      )
      (ok true)
    )
    invite-not-exists-err
  )
)

;; reject invite from sender
(define-public (reject-invite-from (sender principal))
  (if (is-invited sender tx-sender)
    (begin
      ;; update status of invite
      (map-set invite
          {sender: sender, recipient: tx-sender}
          {status: u2}
      )
      (ok true)
    )
    invite-not-exists-err
  )
)

(define-public (withdraw)
  ;; can withdraw only if success invite count greater or equal 10
  (if (>= (success-invite-count-of tx-sender) u10)
    (begin
      (let ((recipient tx-sender))
        (as-contract (stx-transfer? (balance-of recipient) tx-sender recipient))
        ;; reset invite
        ;; update status of invite
        (map-set init-deposit
            {member: tx-sender}
            {amount: u0}
        )
        ;; update success invite count of tx-sender
        (map-set success-invite-count
            {member: tx-sender}
            {count: u0}
        )
      )
      (ok tx-sender)
    )
    withdraw-err
  )
)
