(async function() {
	const NORMAL_START = { "hour": 8, "min": 30 };
	const NORMAL_END   = { "hour": 15, "min": 35 };
	const EARLY_END    = { "hour": 13, "min": 30 };
	const HALF_END     = { "hour": 11, "min": 45 };

	/**
	 * Load dates from our database
	 */
	async function loadDates() {
		let res = await window.fetch('./dates.json');
		let json = await res.text();
		let dates = JSON.parse(json);
	
		return dates;
	}

	function getNextDate(dates) {
		var kind;
	
		for (i in dates) {
			let now = new Date(Date.now());
			var date = new Date(dates[i]["start"]+' EST');
	
			switch (dates[i]["kind"]) {
				case 'break':
					kind = 'Break';
					break;
				case 'holiday':
					kind = 'Holiday';
					break;
				case 'elearning':
					kind = 'E-learning';
					break;
				case 'teacher':
					kind = 'Teacher workday';
					break;
				case 'early':
					kind = 'Early Release';
					date.setHours(EARLY_END.hour);
					date.setMinutes(EARLY_END.min);
					break;
				case 'half':
					kind = 'Half day';
					date.setHours(HALF_END.hour);
					date.setMinutes(HALF_END.min);
					break;
			}
			
			if (now.getTime() < date.getTime()) {
				return { "kind": kind, "start": date };
			}	
		}
	}
	
	let dates = await loadDates();
	let next = getNextDate(dates);
	document.getElementById('kind').innerText = next["kind"];

	setInterval(async function() {
		// Get current time as milliseconds
		let curr_time = new Date(Date.now()).getTime();
		// Calculate diff between event start and current time
		let countdown = next["start"].getTime() - curr_time;

		let days = Math.floor(countdown / (1000 * 60 * 60 * 24));
		let hours = Math.floor((countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let minutes = Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((countdown % (1000 * 60)) / 1000);

		// Timestamp for end of the current day
		var currDayEnd = new Date(curr_time);
		currDayEnd.setHours(NORMAL_END.hour);
		currDayEnd.setMinutes(NORMAL_END.min);

		// Timestamp for the start day of the event
		var eventDayStart = new Date(next["start"]);
		eventDayStart.setHours(NORMAL_START.hour);
		eventDayStart.setMinutes(NORMAL_START.min);

		document.getElementById('countdown').innerText = (days == 0)
			//? (curr_time > currDayEnd && curr_time < eventDayStart)
			//	? 'Tomorrow'
			//	: `${hours} hours, ${minutes} minutes, ${seconds} seconds`
			? `${hours} hours, ${minutes} minutes, ${seconds} seconds`
			: `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

		document.getElementById('encouragement').hidden = (curr_time > currDayEnd && curr_time < eventDayStart);
	}, 100);
})();
