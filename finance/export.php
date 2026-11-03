<?php
require __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/finance_lib.php';
$user = require_admin();
$R = resolve_range('all'); $cp = get('cycle_id'); $cycleId = $cp === 'none' ? -1 : (int)$cp;
$tbl = get('type') === 'revenue' ? 'revenue' : 'expenses';
[$W, $P] = fin_scope('e', $R, $cycleId, (int)get('house_id'), (int)get('category_id'), get('q'));
$list = rows("SELECT e.*, fc.name cat, c.cycle_name, h.house_number FROM $tbl e JOIN finance_categories fc ON fc.id = e.category_id LEFT JOIN production_cycles c ON c.id = e.cycle_id LEFT JOIN houses h ON h.id = COALESCE(e.house_id, c.house_id) WHERE $W ORDER BY e.txn_date DESC, e.id DESC LIMIT 50000", $P);
$out = array_map(fn($x) => [$x['txn_date'], $x['cat'], $x['description'], $x['amount'], setting('currency_code', 'KHR'), $x['cycle_name'] ?? 'Unallocated', $x['house_number'] ? 'House ' . $x['house_number'] : '', $x['payment_method'], $x['reference'], $x['notes']], $list);
audit_log("finance.export_$tbl", 'finance', null, null, ['rows' => count($out)]);
csv_download("$tbl-" . today() . '.csv', ['Date', 'Category', 'Description', 'Amount', 'Currency', 'Cycle', 'House', 'Payment', 'Reference', 'Notes'], $out);
