set wbs to {"btprt.dj", "soundcloud.com", "www.youtube.com", "www.dazn.com", "www.netflix.com", "www.beatport.com", "be-at.tv", "www.skygo.sky.de", "open.spotify.com"} --"www.facebook.com"
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
						set playing to execute t javascript "document.querySelector('.playControl') ? document.querySelector('.playControl').classList.contains('playing') : false"
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('.playbackSoundBadge__title>a') ? document.querySelector('.playbackSoundBadge__title>a').title : ' '"
						set pTitle to "Soundcloud: " & pTitle
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
						end if
					else if ("www.youtube.com" is equal to actHost) then
						set playing to execute t javascript "document.querySelector('#movie_player video') ? !document.querySelector('#movie_player video').paused : false"
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.title ? document.title.replace(': YouTube', '') : ' '"
						set pTitle to "Youtube: " & pTitle
						set youtubeBrowse to "https://www.youtube.com/"
						if ready is equal to "complete" and actUrl is not equal to youtubeBrowse then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", true}})
								end if
								set play to true
							end if
							--display dialog id of t & " " & pTitle & " " & actUrl & " " & play
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
						end if
					else if ("www.dazn.com" is equal to actHost) then
						--set playing to execute t javascript "document.querySelector('.iconfont-ls_icon_pause')"
						set playing to execute t javascript "document.querySelector('video') ? !document.querySelector('video').paused : false"
						--if playing is equal to {} then
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('.title') ? document.querySelector('.title').textContent : false"
						set pTitle to "DAZN: " & pTitle
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
						end if
					else if ("www.netflix.com" is equal to actHost) then
						set playing to execute t javascript "document.querySelector('video') ? !document.querySelector('video').paused : false"
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('.ellipsize-text>h4') ? document.querySelector('.ellipsize-text>h4').textContent : ''"
						--ignore browser page videos
						if ready is equal to "complete" and actUrl is not equal to "https://www.netflix.com/browse" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", "Netflix: " & pTitle}, {"url", actUrl}, {"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", "Netflix: " & pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
						end if
					else if (actHost is equal to "www.beatport.com") then --"btprt.dj" or
						set playing to execute t javascript "document.querySelector('.pause') ? document.querySelector('.play') === null : false"
						set ready to execute t javascript "document.readyState"
						set primaryTitle to execute t javascript "document.querySelector('.primary-title') ? document.querySelector('.primary-title').textContent : ' '"
						set remixed to execute t javascript "document.querySelector('.remixed') ? document.querySelector('.remixed').textContent : ' ' "
						set pTitle to "Beatport: " & primaryTitle & " (" & remixed & ")"
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
						end if
					else if (actHost is equal to "btprt.dj") then 		
						set ready to execute t javascript "document.readyState"
						execute t javascript "document.querySelector('iframe') !== null ? window.location = document.querySelector('iframe').src : 0;"
						execute t javascript "console.log('bla')"
					else if ("www.skygo.sky.de" is equal to actHost) then
						set playing to execute t javascript "document.querySelector('video') ? !document.querySelector('video').paused : false"
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('.detail_header>h1') !== null ? document.querySelector('.detail_header>h1').textContent : false"
						set pTitle to "SkyGo: " & pTitle
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
						end if
					else if ("be-at.tv" is equal to actHost) then
						set playing to execute t javascript "document.querySelector('#radio .playbutton') ? document.querySelector('#radio .playbutton').style.display === 'none' : false"
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('#ticker') ? document.querySelector('#ticker').textContent : ' ' "
						set pTitle to "Be-At TV: " & pTitle
						if ready is equal to "complete" then
							if playing is equal to true then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
						end if
					else if ("www.facebook.com" is equal to actHost) then
						set ready to execute t javascript "document.readyState"
						if ready is equal to "complete" then
							set activeVid to execute t javascript "document.querySelector('._1kfk')"
							set playing to execute t javascript "!document.querySelector('video').paused"
							if playing is equal to true and activeVid is equal to {} then
								if actUrl is equal to activeTabUrl then
									set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", true}})
								end if
								set play to true
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
						end if
					else if ("open.spotify.com" is equal to actHost) then
						set ready to execute t javascript "document.readyState"
						set pTitle to execute t javascript "document.querySelector('.track-info__name') ? document.querySelector('.track-info__name').textContent : ' '"
						set pTitle to "Spotify: " & pTitle
						if ready is equal to "complete" then
							set playing to execute t javascript "document.querySelector('.control-button--circled') ? document.querySelector('.control-button--circled').classList.contains('spoticon-pause-16'): false"
							--set actUrl to execute t javascript "document.querySelector('.track-info__name.ellipsis-one-line').children[0].children[0].href" 
							if get running of application "Spotify" is false then
								if playing is true then
									if "open.spotify.com" is in activeTabUrl then
										set handleTab to json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", true}})
									end if
									set play to true
								end if
							end if
							copy json's createDictWith({{"id", id of t}, {"title", pTitle}, {"url", actUrl}, {"playing", playing}}) to end of sites
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