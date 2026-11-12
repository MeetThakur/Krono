# Krono privacy

Updated 12 November 2026.

Krono does not require a Krono account. It does not ask for coding-platform passwords or authentication tokens.

## Data on your device

Krono stores the public handles you connect, cached profile statistics, rivals, contest schedules, reminder choices, appearance preferences and manually logged practice history on your device. The store edition and the original GitHub edition have separate app storage.

You can remove connected profiles and rivals in the app. Clearing the app's storage or uninstalling it removes its local data. Android device backup and restore may retain or restore app data, depending on your device's backup settings.

## Network requests

Krono requests public profile information, contest schedules and daily challenges directly from Codeforces, LeetCode, CodeChef, AtCoder and the AtCoder Problems community API at kenkoooo.com. Profile requests include the handle being looked up. Those services receive normal connection information, including your IP address, and apply their own privacy policies.

Opening an external profile or contest opens the corresponding website. Adding a contest to your calendar uses Android's calendar application and asks you to save the event there.

Krono does not operate a backend for these requests. The app has no advertising or analytics SDK. Debug builds can write basic HTTP request information to local Android logs; release builds disable HTTP logging.

## Permissions

- Internet and network state: refresh public platform data.
- Notifications: show contest reminders when permitted.
- Exact alarms: request precise reminder timing where Android permits it.
- Boot completed, wake lock and vibration: restore scheduled work and deliver reminders.

## Contact

Report privacy questions or bugs at https://github.com/MeetThakur/Krono/issues. Issues are public; do not include passwords or private account information.
