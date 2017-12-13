--if spotify is not running 
on play()
	if get running of application "Spotify" is true then
		tell application "Spotify"
			play
		end tell
	else
		tell application "Spotify"
			activate
		end tell
	end if
end play

on pause()
	if get running of application "Spotify" is true then
		tell application "Spotify" to pause
	end if
end pause

on previous()
	if get running of application "Spotify" is true then
		tell application "Spotify" to previous track
	end if
end previous

on next()
	if get running of application "Spotify" is true then
		tell application "Spotify" to next track
	end if
end next

on run argv
	--if get running of application "Spotify" is true then
	set command to item 1 of argv
	if command is "play" then
		play()
	else if command is "pause" then
		pause()
	else if command is "next" then
		next()
	else if command is "previous" then
		previous()
	else
		return "{\"error\":\"Unsupported command\"}"
	end if
	--end if
end run