# backfill-metadata
JS script to backfill brackets plugins metadata registry to elastic search clusters.

# Steps

1. Copy the registry metadata file and the file containing the npm registry URL(check plugin-to-npm-url.json) in the root directory locally before running this script.
2. Change the variable NODE_ADDRESS in backfill.js with elastic search node addr .
3. Build the package and run "node backfill.js".

# Debugging Failed Records

The failed metadata records will be stored as a JSON map (check backfill-failure(example).json) with the following structure :

1. KEY (String): plugin name (unique so no chance of collision)
2. VALUE (String): Error reason.