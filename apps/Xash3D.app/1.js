		function parseHashBangArgs(aURL) {
			aURL = aURL || window.location.href;
			
			var vars = {};
			var hashes = aURL.slice(aURL.indexOf('#') + 1).split('&');
			
			for(var i = 0; i < hashes.length; i++) {
				var hash = hashes[i].split('=');
			
				if(hash.length > 1) {
					vars[hash[0]] = hash[1];
				} else {
					vars[hash[0]] = null;
				}
			}
		
			return vars;
		}
