import type { Metadata } from "next";
import { getTrackingSettings } from "@/lib/tracking";
import { TrackingSettingsEditor } from "@/components/admin/tracking-settings-editor";

export const metadata: Metadata = {
	title: "Tracking | Admin",
};

export default async function TrackingPage() {
	const settings = await getTrackingSettings();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Tracking</h1>
			<TrackingSettingsEditor
				settings={{
					metaPixelEnabled: settings?.metaPixelEnabled ?? false,
					metaPixelId: settings?.metaPixelId ?? "",
					metaCapiEnabled: settings?.metaCapiEnabled ?? false,
					hasCapiToken: !!settings?.metaCapiToken,
					utmTrackingEnabled: settings?.utmTrackingEnabled ?? true,
				}}
			/>
		</div>
	);
}
