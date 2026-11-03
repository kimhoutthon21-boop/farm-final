<?php
/** Fields shared by the worker form and the admin correction form. */
function report_fields(array $v, array $causes, array $tasks, array $workers, bool $admin): void {
    $partial = (int)setting('allow_partial_bags', 1);
    echo '<div class="form-grid">';
    echo '<div class="field"><label for="f-date">Report date</label><input type="date" id="f-date" name="report_date" value="' . e($v['report_date']) . '" max="' . e(today()) . '" required></div>';
    echo '<div class="field"><label for="f-worker">Worker who recorded the report</label>';
    if ($admin) { echo '<select id="f-worker" name="worker_id">'; foreach ($workers as $w) echo '<option value="' . $w['id'] . '"' . ((int)$v['worker_id'] === (int)$w['id'] ? ' selected' : '') . '>' . e($w['full_name']) . '</option>'; echo '</select>'; }
    else echo '<input type="text" id="f-worker" value="' . e(current_user()['full_name']) . '" readonly>';
    echo '</div>';
    echo '<div class="field"><label for="f-feed">Feed consumed today (bags)</label><div class="stepper"><button type="button" class="btn" data-step="-' . ($partial ? '0.5' : '1') . '" data-target="f-feed" aria-label="Less feed">' . icon('minus', 20) . '</button><input type="number" id="f-feed" name="feed_bags" inputmode="decimal" min="0" step="any" value="' . e($v['feed_bags']) . '" required><button type="button" class="btn" data-step="' . ($partial ? '0.5' : '1') . '" data-target="f-feed" aria-label="More feed">' . icon('plus', 20) . '</button></div><div class="hint">' . ($partial ? 'Partial bags are allowed, for example 12.5.' : 'Whole bags only.') . ((float)setting('bag_weight_kg', 0) > 0 ? ' 1 bag = ' . e(setting('bag_weight_kg')) . ' kg.' : '') . '</div></div>';
    echo '<div class="field"><label for="f-deaths">Dead chickens today</label><div class="stepper"><button type="button" class="btn" data-step="-1" data-target="f-deaths" aria-label="Fewer deaths">' . icon('minus', 20) . '</button><input type="number" id="f-deaths" name="deaths" inputmode="numeric" min="0" step="1" value="' . e($v['deaths']) . '" required><button type="button" class="btn" data-step="1" data-target="f-deaths" aria-label="More deaths">' . icon('plus', 20) . '</button></div><div class="hint" id="living-hint"></div></div>';
    echo '<div class="field full" id="cause-wrap" hidden><label for="f-cause">Cause of death</label><select id="f-cause" name="death_cause_id"><option value="">Choose a cause…</option>';
    foreach ($causes as $c) echo '<option value="' . $c['id'] . '" data-detail="' . (int)$c['requires_detail'] . '"' . ((int)$v['death_cause_id'] === (int)$c['id'] ? ' selected' : '') . '>' . e($c['name']) . ((int)$c['is_active'] ? '' : ' (inactive)') . '</option>';
    echo '</select><div id="detail-wrap" hidden style="margin-top:10px"><label for="f-detail">Describe the cause</label><textarea id="f-detail" name="death_cause_detail" maxlength="500">' . e($v['death_cause_detail']) . '</textarea></div></div>';
    echo '<div class="field full"><label>Work performed today</label><div class="pills" id="task-pills">';
    foreach ($tasks as $t) echo '<label class="pill"><input type="checkbox" name="tasks[]" value="' . $t['id'] . '" data-label="' . e($t['name']) . '"' . (in_array((int)$t['id'], $v['tasks'], true) ? ' checked' : '') . '><span>' . e($t['name']) . '</span></label>';
    echo '</div></div><div class="field full"><label for="f-desc">Work description (optional if a task is selected)</label><textarea id="f-desc" name="work_description" maxlength="2000">' . e($v['work_description']) . '</textarea></div>';
    echo '<div class="field full"><label for="f-notes">Additional notes (optional)</label><textarea id="f-notes" name="notes" maxlength="2000">' . e($v['notes']) . '</textarea></div></div>';
}
function report_form_data(): array {
    return ['causes' => rows('SELECT * FROM death_causes WHERE is_active = 1 ORDER BY sort_order, name'), 'tasks' => rows('SELECT * FROM work_task_categories WHERE is_active = 1 ORDER BY sort_order, name'),
            'workers' => rows('SELECT id, full_name FROM users WHERE is_active = 1 ORDER BY full_name')];
}
