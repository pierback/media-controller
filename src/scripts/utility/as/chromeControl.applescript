on handlerTab(argv)
	set handleTab to false
	
	tell application "Finder"
		set json_path to file "json.scpt" of folder of (path to me)
	end tell
	set json to load script (json_path as alias)
	if get running of application "Google Chrome" is true
	tell application "Google Chrome"
		set activeTab to active tab of first window
		tell activeTab to set activeTabUrl to URL
		
		repeat with w in windows -- loop for each window, w is a variable which contain the window object
			repeat with t in tabs of w
				tell t to set actUrl to URL
				if argv is in actUrl then
					set handleTab to true
				end if
			end repeat
		end repeat
	end tell
	end if
	
	set playingObj to json's createDictWith({{"handletab", handleTab}})
	return json's encode(playingObj)
end handlerTab

on spotifyHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				execute actionTab javascript "document.querySelector('.spoticon-play-16').click()"
			else if playerAction is "next" then
				execute actionTab javascript " document.querySelector('.spoticon-skip-forward-16').click()"
			else if playerAction is "previous" then
				execute actionTab javascript "document.querySelector('.spoticon-skip-back-16').click()"
			end if
		else
			if playerAction is "pause" then
				set playing to execute actionTab javascript "document.querySelector('.spoticon-pause-16')"
				if playing is equal to {} then
					execute actionTab javascript "document.querySelector('.spoticon-pause-16').click()"
				end if
			end if
		end if
	end tell
end spotifyHandler


on beattvHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				execute actionTab javascript "document.querySelector('.playbutton.btn').click()"
			else if playerAction is "next" then
				execute actionTab javascript "document.querySelector('.player-controls > .next-button').click()"
			else if playerAction is "previous" then
				execute actionTab javascript "document.querySelector('.player-controls > .prev-button').click()"
			end if
		else
			if playerAction is "pause" then
				set playing to execute actionTab javascript "document.querySelector('.play-button.play') === null"
				if playing is equal to true then
					set playing to execute actionTab javascript "document.querySelector('.pausebutton.btn').click()"
				end if
			end if
		end if
	end tell
end beattvHandler


on facebookHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				execute actionTab javascript "document.querySelector('video').play()"
			end if
		else
			if playerAction is "pause" then
				set playing to execute actionTab javascript "!document.querySelector('video').paused"
				if playing is equal to true then
					execute actionTab javascript "document.querySelector('video').pause()"
				end if
			end if
		end if
	end tell
end facebookHandler


on skygoHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				set playing to execute actionTab javascript "document.querySelector('.overlay-ready-to-play-sd')"
				if playing is equal to {} then
					execute actionTab javascript "document.querySelector('.overlay-ready-to-play-sd').click()"
				else
					execute actionTab javascript "document.querySelector('video').play()"
				end if
			else if playerAction is "next" then
				execute actionTab javascript "document.querySelector('#lnk_next_eps').click()"
			else if playerAction is "previous" then
				execute actionTab javascript "document.querySelector('#lnk_prev_eps').click()"
			end if
		else
			if playerAction is "pause" then
				set playing to execute actionTab javascript "!document.querySelector('video').paused"
				if playing is equal to true then
					execute actionTab javascript " document.querySelector('.control-pause-button').click()"
				end if
			end if
		end if
	end tell
end skygoHandler


on beatportHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				execute actionTab javascript "document.querySelector('.play-button.play').click()"
			else if playerAction is "next" then
				execute actionTab javascript " document.querySelector('.player-controls > .next-button').click()"
			else if playerAction is "previous" then
				execute actionTab javascript "document.querySelector('.player-controls > .prev-button').click()"
			end if
		else
			if playerAction is "pause" then
				set playing to execute actionTab javascript "document.querySelector('.play-button.play') === null"
				if playing is equal to true then
					set playing to execute actionTab javascript "document.querySelector('.play-button.pause').click()"
				end if
			end if
		end if
	end tell
end beatportHandler


on netflixHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				execute actionTab javascript "document.querySelectorAll('.play')[0].click()"
				execute actionTab javascript "document.querySelector('video').play()"
			else if playerAction is "next" then
				set outro to execute actionTab javascript "document.querySelectorAll('.player-next-episode')[0]"
				if outro is equal to {} then
					execute actionTab javascript "document.querySelectorAll('.player-next-episode')[0].click()"
				else
					execute actionTab javascript "document.querySelectorAll('.postplay-still-container')[0].click()"
				end if
			else if playerAction is "previous" then
				execute actionTab javascript "document.querySelector('#lnk_prev_eps').click()"
			end if
		else
			set playing to execute actionTab javascript "!document.querySelector('video').paused"
			if playing is equal to true then
				execute actionTab javascript "document.querySelectorAll('.pause')[0].click()"
				execute actionTab javascript "document.querySelector('video').pause()"
			end if
		end if
	end tell
end netflixHandler


on daznHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				execute actionTab javascript "document.querySelector('video').play()"
			end if
		else
			if playerAction is "pause" then
				set playing to execute actionTab javascript "document.querySelector('.iconfont-ls_icon_pause')"
				if playing is equal to {} then
					execute actionTab javascript "document.querySelector('.iconfont-ls_icon_pause').click()"
				end if
			end if
		end if
	end tell
end daznHandler


on youtubeHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				execute actionTab javascript "document.querySelector('video').play()"
			else if playerAction is "next" then
				execute actionTab javascript "document.querySelector('#movie_player .ytp-next-button').click()"
			else if playerAction is "previous" then
				execute actionTab javascript "window.history.back()"
			end if
		else
			if playerAction is "pause" then
				set playing to execute actionTab javascript "!document.querySelector('#movie_player video').paused"
				if playing is equal to true then
					execute actionTab javascript "document.querySelector('#movie_player video').pause()"
				end if
			end if
		end if
	end tell
end youtubeHandler

on soundcloudHandler(actionTab, playerAction, hturl, aturl)
	tell application "Google Chrome"
		if hturl is in aturl then
			if playerAction is "play" then
				execute actionTab javascript "document.querySelectorAll('.playControl')[0].click()"
			else if playerAction is "next" then
				execute actionTab javascript "document.querySelectorAll('.skipControl__next')[0].click()"
			else if playerAction is "previous" then
				execute actionTab javascript "document.querySelectorAll('.skipControl__previous')[0].click()"
			end if
		else
			if playerAction is "pause" then
				set playing to execute actionTab javascript "document.querySelector('.playControl').classList.contains('playing')"
				if playing is equal to true then
					execute actionTab javascript "document.querySelectorAll('.playControl')[0].click()"
				end if
			end if
		end if
	end tell
end soundcloudHandler

on tabDetection(handleTabUrl, action)
	set wbs to {"soundcloud.com", "www.youtube.com", "www.dazn.com", "www.netflix.com", "www.beatport.com", "be-at.tv", "www.skygo.sky.de", "www.instagram.com", "www.facebook.com", "open.spotify.com"}
	set activeTabUrl to ""
	set actUrl to ""
	tell application "Google Chrome"
		set activeTab to active tab of window 1
		tell activeTab to set activeTabUrl to URL
		repeat with w in windows -- loop for each window, w is a variable which contain the window object
			repeat with t in tabs of w
				tell t to set actUrl to URL
				set actHost to execute t javascript "document.location.host"
				if (wbs contains actHost) then
					if ("soundcloud.com" is equal to actHost) then
						my soundcloudHandler(t, action, handleTabUrl, actUrl)
					else if ("www.youtube.com" is equal to actHost) then
						my youtubeHandler(t, action, handleTabUrl, actUrl)
					else if ("www.dazn.com" is equal to actHost) then
						my daznHandler(t, action, handleTabUrl, actUrl)
					else if ("www.netflix.com" is equal to actHost) then
						my netflixHandler(t, action, handleTabUrl, actUrl)
					else if ("www.beatport.com" is equal to actHost) then
						my beatportHandler(t, action, handleTabUrl, actUrl)
					else if ("www.skygo.sky.de" is equal to actHost) then
						my skygoHandler(t, action, handleTabUrl, actUrl)
					else if ("be-at.tv" is equal to actHost) then
						my beattvHandler(t, action, handleTabUrl, actUrl)
					else if ("www.facebook.com" is equal to actHost) then
						my facebookHandler(t, action, handleTabUrl, actUrl)
					else if ("open.spotify.com" is equal to actHost) then
						my spotifyHandler(t, action, handleTabUrl, actUrl)
					end if
				end if
			end repeat
		end repeat
	end tell
end tabDetection

on run (input)
	set lastActiveApp to ""
	set action to item 1 of input
	set handleTab to item 2 of input
	
	try
		set lastActiveApp to item 3 of input
	end try
	try
		set lastActiveApp to lastActiveApp & " " & item 4 of input
	end try
	try
		set lastActiveApp to lastActiveApp & " " & item 5 of input
	end try
	
	set actionSet to {"play", "pause", "next", "previous"}
	
	if actionSet contains action then
		my tabDetection(handleTab, action)
	else if action is "activate" then
		return activateInstance(handleTab, lastActiveApp)
	else if action is "handlertab" then
		return handlerTab(handleTab)
	else
		return "{\"error\":\"Unsupported command\"}"
	end if
end run