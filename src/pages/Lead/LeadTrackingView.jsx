// src/components/LeadTrackingView.jsx
import React, { useMemo, useState } from 'react';
import { Card, Steps, Timeline, Typography, Space, Button } from 'antd';
import {
    CheckCircleTwoTone,
    ExclamationCircleTwoTone,
    ClockCircleTwoTone,
} from '@ant-design/icons';
import dayjs from 'dayjs';

// map backend stages -> 3 big steps
const STEP_BY_STAGE = {
    new: 0,
    first_conversation: 0,
    interested: 1,
    dropped: 1,
    interested_but_facing_delay: 2,
    converted: 2,
};

const LABEL = {
    new: 'New',
    first_conversation: 'First Conversation',
    interested: 'Interested',
    interested_but_facing_delay: 'Facing Delays',
    converted: 'Converted',
    dropped: 'Dropped',
    not_interested: 'Not Interested',
};

function iconFor(stage) {
    if (stage === 'converted') return <CheckCircleTwoTone twoToneColor="#52c41a" />;
    if (stage === 'dropped') return <ExclamationCircleTwoTone twoToneColor="#faad14" />;
    if (stage === 'not_interested') return <ExclamationCircleTwoTone twoToneColor="#faad14" />;
    if (stage === 'interested_but_facing_delay') return <ExclamationCircleTwoTone twoToneColor="#faad14" />;
    // positive stages
    if (stage === 'new' || stage === 'first_conversation' || stage === 'interested')
        return <CheckCircleTwoTone twoToneColor="#52c41a" />;
    return <ClockCircleTwoTone />;
}

function sortAsc(rows = []) {
    return [...rows].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

function getCurrentStep(rows) {
    if (!rows.length) return 0;
    const lastStage = rows[rows.length - 1].stage;
    return STEP_BY_STAGE[lastStage] ?? 0;
}

export default function LeadTrackingView({
    trackingData = [],
    initialTimelineItems = 3,
    showInCard = true,
}) {
    const [showAll, setShowAll] = useState(false);

    const rows = useMemo(() => sortAsc(trackingData), [trackingData]);
    const current = useMemo(() => getCurrentStep(rows), [rows]);

    const visibleTimeline = showAll ? rows : rows.slice(-initialTimelineItems);

    const timeline = (
        <Timeline
            mode="left"
            style={{ marginTop: 12 }}
            items={visibleTimeline.map((r, i) => ({
                dot: iconFor(r.stage),
                label: dayjs(r.createdAt).format('DD MMM'),
                children: (
                    <Space direction="vertical" size={0}>
                        <Typography.Text strong>{LABEL[r.stage]}</Typography.Text>
                        <Typography.Text type="secondary">
                            {dayjs(r.createdAt).format('hh:mm A')}
                        </Typography.Text>
                    </Space>
                ),
            }))}
        />
    );

    const content = (
        <div>
            {/* TOP — Form Aggregation (3 stages) */}
            <Steps
                current={Math.min(current, 2)}
                items={[
                    { title: <span style={{ fontSize: 12 }}>New</span> },
                    { title: <span style={{ fontSize: 12 }}>Prospecting</span> },
                    { title: <span style={{ fontSize: 12 }}>In Conversion</span> },
                ]}
            />

            {/* BOTTOM — Timeline */}
            {timeline}

            {rows.length > initialTimelineItems && (
                <Button
                    size="small"
                    type="link"
                    onClick={() => setShowAll(!showAll)}
                    style={{ paddingLeft: 0 }}
                >
                    {showAll ? 'Show fewer updates' : 'Show more updates'}
                </Button>
            )}
        </div>
    );

    return showInCard ? (
        <Card size="small" bodyStyle={{ padding: 12 }}>
            {content}
        </Card>
    ) : (
        content
    );
}