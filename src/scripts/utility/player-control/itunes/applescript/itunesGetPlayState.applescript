
tell application "Finder"
	set json_path to file "json.scpt" of folder of (path to me)
end tell
set json to load script (json_path as alias)

set state to false
set appIsrunning to false
set trackId to ""

on IsPlaying()
	tell application "iTunes"
		return player state
	end tell
end IsPlaying


if get running of application "iTunes" is true then
	tell application "iTunes"
		if not (exists current track) then return null
		if player state is playing then set state to true
		set trackId to (get name of current track)
		set trackArtist to (get artist of current track)
		set trackAlbum to (get album of current track)
	end tell
	set appIsrunning to true
else
	set state to false
	set appIsrunning to false
end if

set playingObj to json's createDictWith({{"state", state}, {"running", appIsrunning}, {"trackId", trackId}})
return json's encode(playingObj)



