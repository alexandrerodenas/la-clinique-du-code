# Code Clinic Principles

The Clinic intervenes after development, as a mechanism of
post-processing. It examines the product code to verify its quality,
necessity and its maintainability.

## Practitioners

- The Therapist examines the quality of the code, its architecture and its
refactorability.
- The Diagnostician examines the quality, relevance and robustness of the tests.
- The Radiologist analyzes the history and dependencies to identify areas
of pain.
- The Nutritionist checks that the code is necessary and correctly sized for
its uses.
- The Surgeon only executes a prescription validated by the user.

## Rules

- A diagnosis never changes the code.
- Each finding has a severity and an actionable recommendation.
- The recommendations outline their cost, risk and benefit.
- An operation requires an explicit prescription and the consent of
the user.
- The Surgeon never treats what is not prescribed.
- The Clinic is contacted manually; it does not impose itself in the flow
of development.
- Intensive care mode is an explicit course which loops back to a check-up
after each operation until the actionable prescription is exhausted.
- Intensive care mode is limited to 10 passes and explicitly stops in the event
of failure, refusal or lack of progress.

## Recommended route

```text
Radiologist (optional) -> Checkup -> Surgeon
Nutritionist (optional) -> Surgeon
```

This route is a suggestion. The Radiologist and the Nutritionist are
experts on demand and are not part of the checkup protocol. Each
practitioner can be viewed separately.
