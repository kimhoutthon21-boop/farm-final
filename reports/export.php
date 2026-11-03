<?php
require __DIR__ . '/../includes/bootstrap.php';
$user = require_admin();
$f = ['q' => get('q'), 'from' => valid_date(get('from')) ? get('from') : '', 'to' => valid_date(get('to')) ? get('to') : '', 'house_id' => (int)get('house_id'), 'cycle_id' => (int)get('cycle_id'), 'worker_id' => (int)get('worker_id'), 'status' => get('status')];
$list = fetch_reports($f, 'r.report_date DESC, r.id DESC', 50000, 0); $out = [];
foreach ($list as $r) $out[] = [$r['report_date'], 'House ' . $r['house_number'], $r['cycle_name'], $r['worker_name'], $r['feed_bags'], $r['deaths'], $r['cause_name'], $r['death_cause_detail'], $r['work_description'], $r['notes'], $r['status'] === 'voided' ? 'voided' : ($r['revision'] > 0 ? 'corrected' : 'submitted')];
audit_log('report.export', 'report', null, null, ['rows' => count($out)]);
csv_download('daily-reports-' . today() . '.csv', ['Date', 'House', 'Cycle', 'Worker', 'Feed (bags)', 'Deaths', 'Cause', 'Cause details', 'Work description', 'Notes', 'Status'], $out);
