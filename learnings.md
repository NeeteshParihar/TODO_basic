
# SOP/CORS
```text
This is a very common and highly important security misconception! Let's clarify exactly how the Same-Origin Policy (SOP) operates, because relying on it to block write/update requests is one of the most dangerous security pitfalls in web development.

Here is the key takeaway: SOP/CORS is a read-protection mechanism, NOT a write-protection mechanism.

1. SOP is Enforced After the Request is Processed, Not Before
SOP exists inside the user's browser, not on the server. If a malicious website initiates a cross-origin request:

The browser sends the request (along with any matching cookies) to your server.
Your server receives the request, processes the logic, and executes the database write (e.g., changing the password).
Your server sends the response back to the browser.
SOP is triggered now: The browser checks the CORS headers. If the malicious site is not allowed, the browser hides the response from the malicious site's JavaScript.
The catch: Even though the attacker's script cannot read the 200 OK response, the password has already been changed in the database! The state change has succeeded.
```
# research about it
```text
You might think: "But my API expects JSON, and a cross-origin JSON request (Content-Type: application/json) is a 'non-simple' request that triggers a preflight (OPTIONS) request which my server will reject."

While that is true for JavaScript-initiated fetch calls, attackers have a simple bypass: HTML Forms.
```