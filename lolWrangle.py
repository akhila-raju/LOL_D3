import json
import riotwatcher as rw
import numpy as np
import time
import pickle
import datetime as dt
import csv

#python wrapper supplied by "pseudonym117" at https://github.com/pseudonym117/Riot-Watcher
#combination of multiple scripts, could be cleaned up (pickling is actually useless here)


USERNAME = 'pobelter'
API_KEY = 'REDACTED' #ask for my API key if needed
RANKED_NUM = 775 #a reasonable upper bound

OUT_FILE = open(USERNAME+'.p', 'wb')
watcher = rw.RiotWatcher(API_KEY)
me = watcher.get_summoner(name=USERNAME)
my_ID = me['id']
matches = []


for x in range(1, RANKED_NUM, 15):
	try:
		match = watcher.get_match_history(my_ID, 
			ranked_queues='RANKED_SOLO_5x5', begin_index=x, end_index=x+15)['matches']
		matches.extend(match)
	except KeyError:
		print 'No more matches.'
		break
	time.sleep(1.5)

pickle.dump(matches, OUT_FILE)
OUT_FILE.close()

IN_FILE = open(USERNAME+'.p', 'rb')
matches = pickle.load(IN_FILE)
matchDicts = []
OUT_FILE = open(USERNAME+'_less.p', 'wb')

for match in matches:
	matchDict = {}
	#stuff in outer json layers
	matchDict['matchID'] = match['matchId']
	matchDict['time'] = match['matchCreation']
	matchDict['champion'] = match['participants'][0]['championId']
	#inside 'stats'
	stats = match['participants'][0]['stats']
	matchDict['kills'] = stats['kills']
	matchDict['deaths'] = stats['deaths']
	matchDict['assists'] = stats['assists']
	matchDict['goldEarned'] = stats['goldEarned']
	matchDict['winner'] = stats['winner']
	matchDict['minionsKilled'] = stats['minionsKilled']
	matchDict['wardsPlaced'] = stats['wardsPlaced']
	#inside 'timeline'
	timeline = match['participants'][0]['timeline']
	matchDict['lane'] = timeline['lane']
	matchDict['role'] = timeline['role']
	matchDicts.append(matchDict)

pickle.dump(matchDicts, OUT_FILE)
OUT_FILE.close()

IN_FILE = open(USERNAME+'_less.p', 'rb')
matches = pickle.load(IN_FILE)
header = ['matchID', 'time', 'winner', 'champion', 'lane',
		 'role', 'kills', 'deaths', 'assists', 'minionsKilled', 
		 'goldEarned', 'wardsPlaced']

OUT_FILE = open(USERNAME+'.csv', 'w')
writer = csv.writer(OUT_FILE)
writer.writerow(header)
for match in matches:
	writer.writerow([match[x] for x in header])
OUT_FILE.close()