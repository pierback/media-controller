property spotPause : «constant ****kPSp»
property spotPlay : «constant ****kPSP»

tell application "Finder"
	set json_path to file "json.scpt" of folder of (path to me)
end tell
set json to load script (json_path as alias)

set state to false
set appIsrunning to false
set trackId to ""

if get running of application "Spotify" is true then
	tell application "Spotify"
		
		set playerState to player state
		if playerState = spotPause then
			--set playingObj to json's createDictWith({{"state", false}})
			set state to false
		else if playerState = spotPlay then
			--set playingObj to json's createDictWith({{"state", true}})
			set state to true
		end if
		set appIsrunning to true
		set trackId to spotify url of current track
	end tell
else
	set state to false
	set appIsrunning to false
end if

set playingObj to json's createDictWith({{"state", state}, {"running", appIsrunning}, {"trackId", trackId}})
return json's encode(playingObj)



