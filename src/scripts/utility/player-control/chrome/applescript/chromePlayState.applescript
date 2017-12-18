set wbs to {"soundcloud.com", "www.youtube.com", "www.dazn.com", "www.netflix.com", "www.beatport.com", "be-at.tv", "www.skygo.sky.de", "open.spotify.com"} --"www.facebook.com"
set playingObj to {{}}
set sites to {}
set play to false
set handleTab to ""
set actUrl to ""
set idleTabs to {}
set idleTabUrl to ""
set activeTabUrl to ""
set currentTab to ""
set handleTab to ""
set pTitle to ""
set tabID to 0

tell application "Finder"
	set json_path to file "json.scpt" of folder of (path to me)
end tell
set json to load script (json_path as alias)

if get running of application "Google Chrome" is true then
	tell application "Google Chrome"
		set activeTab to active tab of first window
		tell activeTab to set activeTabUrl to URL
		set currentTab to json's createDictWith({{"id", id of activeTab}, {"url", activeTabUrl}})
		
		repeat with w in windows -- loop for each window, w is a variable which contain the window object
			repeat with t in tabs of w
				tell t to set actUrl to URL
				set actHost to execute t javascript "document.location.host"
				if (wbs contains actHost) then
					if ("soundcloud.com" is equal to actHost) then
						set playing to execute t javascript "document.querySelector('.playControl').classList.contains('playing')"
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('.playbackSoundBadge__title>a').title"
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle},{"url", actUrl},{"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if
					else if ("www.youtube.com" is equal to actHost) then
						set playing to execute t javascript "!document.querySelector('#movie_player video').paused"
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.title.replace(' - YouTube', '')"
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle},{"url", actUrl},{"playing", true}})
								end if
								set play to true
							end if
							--display dialog id of t & " " & pTitle & " " & actUrl & " " & play
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if
					else if ("www.dazn.com" is equal to actHost) then
						--set playing to execute t javascript "document.querySelector('.iconfont-ls_icon_pause')"
						set playing to execute t javascript "!document.querySelector('video').paused"
						--if playing is equal to {} then
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('.title').textContent"
						set pTitle to "DAZN - " & pTitle
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle},{"url", actUrl},{"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if
					else if ("www.netflix.com" is equal to actHost) then
						set playing to execute t javascript "!document.querySelector('video').paused"
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('.ellipsize-text>h4').textContent"
						--ignore browser page videos
						if ready is equal to "complete" and actUrl is not equal to "https://www.netflix.com/browse" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", "Netflix - " & pTitle},{"url", actUrl},{"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title",  "Netflix - " & pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if
					else if ("www.beatport.com" is equal to actHost) then
						set playing to execute t javascript "document.querySelector('.play-button.play') === null"
						set ready to execute t javascript "document.readyState"
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle},{"url", actUrl},{"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if
					else if ("www.skygo.sky.de" is equal to actHost) then
						set playing to execute t javascript "!document.querySelector('video').paused"
						set ready to execute t javascript "document.readyState"
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle},{"url", actUrl},{"playing", true}})
								end if 
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if
					else if ("be-at.tv" is equal to actHost) then
						set playing to execute t javascript "document.querySelector('#radio .playbutton')
      .style.display === 'none'"
						set ready to execute t javascript "document.readyState"
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle},{"url", actUrl},{"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if
					else if ("www.facebook.com" is equal to actHost) then
						set ready to execute t javascript "document.readyState"
						if ready is equal to "complete" then
							set activeVid to execute t javascript "document.querySelector('._1kfk')"
							set playing to execute t javascript "!document.querySelector('video').paused"
							if playing is equal to true and activeVid is equal to {} then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle},{"url", actUrl},{"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if
					else if ("open.spotify.com" is equal to actHost) then
						set ready to execute t javascript "document.readyState"
						if ready is equal to "complete" then
							set playing to execute t javascript "document.querySelector('.control-button--circled').classList.contains('spoticon-pause-16')"
							--set actUrl to execute t javascript "document.querySelector('.track-info__name.ellipsis-one-line').children[0].children[0].href" 
							if get running of application "Spotify" is false then
								if playing is true then
									if "open.spotify.com" is in activeTabUrl then
										set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle},{"url", actUrl},{"playing", true}})
									end if
									set play to true
								end if
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", play}}) to end of sites
						end if	
					end if
				end if
			end repeat
		end repeat
		
		if handleTab is equal to "" then
			if idleTabs contains activeTabUrl then
				set idleTabUrl to activeTabUrl
			else
				if idleTabs is equal to {} then
					set idleTabUrl to ""
				else
					set idleTabUrl to item 1 of idleTabs
				end if
			end if
		end if
	end tell
	set playingObj to json's createDictWith({{"sites", sites}, {"handleTab", handleTab}, {"currentTab", currentTab}, {"isRunning", true}})
else
	set playingObj to json's createDictWith({{"sites", sites}, {"handleTab", handleTab}, {"currentTab", currentTab}, {"isRunning", false}})
end if
return json's encode(playingObj)