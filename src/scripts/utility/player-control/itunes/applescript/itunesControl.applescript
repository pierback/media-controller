on play()
	if get running of application "iTunes" is true then
		tell application "iTunes"
			play
		end tell
	else
		tell application "iTunes"
			activate
		end tell
	end if
end play

on pause()
	if get running of application "iTunes" is true then
		tell application "iTunes" to pause
	end if
end pause

on next()
	if get running of application "iTunes" is true then
		tell application "iTunes"
			next track
		end tell
	end if
end next

on previous()
	if get running of application "iTunes" is true then
		tell application "iTunes"
			previous track
		end tell
	end if
end previous

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