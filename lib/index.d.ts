// Generated by dts-bundle-generator v5.5.0

export declare type SupportedLanguages = "en_US" | "en" | "de_DE" | "de" | "es_ES" | "es" | "fr_FR" | "fr";
export declare type LocaleConfig = {
	locale?: SupportedLanguages;
	phrases: Record<string, unknown>;
	mobilePhrases?: Record<string, unknown>;
};
declare const STEP_WELCOME = "welcome";
declare const STEP_USER_CONSENT = "userConsent";
declare const STEP_DOCUMENT = "document";
declare const STEP_POA = "poa";
declare const STEP_FACE = "face";
declare const STEP_COMPLETE = "complete";
export declare type StepTypes = typeof STEP_WELCOME | typeof STEP_USER_CONSENT | typeof STEP_DOCUMENT | typeof STEP_POA | typeof STEP_FACE | typeof STEP_COMPLETE;
export declare type DocumentTypes = "passport" | "driving_licence" | "national_identity_card" | "residence_permit";
export declare type PoaTypes = "bank_building_society_statement" | "utility_bill" | "council_tax" | "benefit_letters" | "government_letter";
export declare type RequestedVariant = "standard" | "video";
export declare type DocumentTypeConfig = boolean | {
	country: string | null;
};
export declare type CaptureOptions = {
	requestedVariant?: RequestedVariant;
	uploadFallback?: boolean;
	useUploader?: boolean;
	useWebcam?: boolean;
};
export declare type StepOptionWelcome = {
	title?: string;
	descriptions?: string[];
	nextButton?: string;
};
export declare type StepOptionDocument = {
	documentTypes?: Partial<Record<DocumentTypes, DocumentTypeConfig>>;
	forceCrossDevice?: boolean;
	showCountrySelection?: boolean;
	useLiveDocumentCapture?: boolean;
} & CaptureOptions;
export declare type StepOptionPoA = {
	country?: string;
	documentTypes?: Partial<Record<PoaTypes, boolean>>;
};
export declare type StepOptionFace = {
	useMultipleSelfieCapture?: boolean;
} & CaptureOptions;
export declare type StepOptionComplete = {
	message?: string;
	submessage?: string;
};
export declare type StepConfigWelcome = {
	type: typeof STEP_WELCOME;
	options?: StepOptionWelcome;
};
export declare type StepConfigUserConsent = {
	type: typeof STEP_USER_CONSENT;
	options?: never;
};
export declare type StepConfigDocument = {
	type: typeof STEP_DOCUMENT;
	options?: StepOptionDocument;
};
export declare type StepConfigPoA = {
	type: typeof STEP_POA;
	options?: StepOptionPoA;
};
export declare type StepConfigFace = {
	type: typeof STEP_FACE;
	options?: StepOptionFace;
};
export declare type StepConfigComplete = {
	type: typeof STEP_COMPLETE;
	options?: StepOptionComplete;
};
export declare type StepConfig = StepConfigWelcome | StepConfigUserConsent | StepConfigDocument | StepConfigPoA | StepConfigFace | StepConfigComplete;
export declare type UICustomizationOptions = {
	colorBackgroundSurfaceModal?: string;
	colorBorderSurfaceModal?: string;
	borderWidthSurfaceModal?: string;
	borderStyleSurfaceModal?: string;
	fontFamilyTitle?: string;
	fontSizeTitle?: string;
	fontWeightTitle?: number;
	colorContentTitle?: string;
	fontFamilySubtitle?: string;
	fontSizeSubtitle?: string;
	fontWeightSubtitle?: number;
	colorContentSubtitle?: string;
	fontFamilyBody?: string;
	fontSizeBody?: string;
	fontWeightBody?: number;
	colorContentBody?: string;
	colorContentButtonPrimaryText?: string;
	colorBackgroundButtonPrimary?: string;
	colorBackgroundButtonPrimaryHover?: string;
	colorBackgroundButtonPrimaryActive?: string;
	colorBorderButtonPrimary?: string;
	colorContentButtonSecondaryText?: string;
	colorBackgroundButtonSecondary?: string;
	colorBackgroundButtonSecondaryHover?: string;
	colorBackgroundButtonSecondaryActive?: string;
	colorBorderButtonSecondary?: string;
	borderRadiusButton?: string;
	buttonGroupStacked?: boolean;
	colorContentDocTypeButton?: string;
	colorBackgroundDocTypeButton?: string;
	colorBorderDocTypeButton?: string;
	colorBorderDocTypeButtonHover?: string;
	colorBorderDocTypeButtonActive?: string;
	colorBackgroundIcon?: string;
	colorBorderLinkUnderline?: string;
	colorContentLinkTextHover?: string;
	colorBackgroundLinkHover?: string;
	colorBackgroundLinkActive?: string;
	colorContentAlertInfo?: string;
	colorBackgroundAlertInfo?: string;
	colorBackgroundAlertInfoLinkHover?: string;
	colorBackgroundAlertInfoLinkActive?: string;
	colorContentAlertError?: string;
	colorBackgroundAlertError?: string;
	colorBackgroundAlertErrorLinkHover?: string;
	colorBackgroundAlertErrorLinkActive?: string;
	colorBackgroundInfoPill?: string;
	colorContentInfoPill?: string;
	colorBackgroundButtonIconHover?: string;
	colorBackgroundButtonIconActive?: string;
	colorBackgroundButtonCameraHover?: string;
	colorBackgroundButtonCameraActive?: string;
};
export declare type DocumentSides = "front" | "back";
export declare type UploadFileResponse = {
	id: string;
	created_at: string;
	file_name: string;
	file_type: string;
	file_size: number;
	href: string;
	download_href: string;
};
export declare type ImageQualityBreakdown = {
	max: number;
	min: number;
	score: number;
	threshold: number;
};
export declare type ImageCutoffBreakdown = {
	has_cutoff: boolean;
} & ImageQualityBreakdown;
export declare type ImageGlareBreakdown = {
	has_glare: boolean;
} & ImageQualityBreakdown;
export declare type ImageBlurBreakdown = {
	has_blur: boolean;
} & ImageQualityBreakdown;
export declare type ImageQualityWarnings = {
	detect_cutoff?: {
		valid: boolean;
	};
	detect_glare?: {
		valid: boolean;
	};
	detect_blur?: {
		valid: boolean;
	};
	image_quality: {
		quality: string;
		breakdown: {
			cutoff?: ImageCutoffBreakdown;
			glare?: ImageGlareBreakdown;
			blur?: ImageBlurBreakdown;
			has_document: boolean;
		};
		image_quality_uuid: string;
	};
};
export declare type DocumentImageResponse = {
	applicant_id: string;
	type: DocumentTypes | PoaTypes;
	side: DocumentSides;
	issuing_country?: string;
	sdk_warnings: ImageQualityWarnings;
} & UploadFileResponse;
declare const CHALLENGE_RECITE = "recite";
declare const CHALLENGE_MOVEMENT = "movement";
export declare type ChallengePayload = {
	type: typeof CHALLENGE_RECITE;
	query: number[];
} | {
	type: typeof CHALLENGE_MOVEMENT;
	query: string;
};
export declare type VideoChallengeLanguage = {
	source: string;
	language_code: SupportedLanguages;
};
export declare type FaceVideoResponse = {
	challenge: ChallengePayload[];
	languages: VideoChallengeLanguage[];
} & UploadFileResponse;
export declare type EnterpriseCobranding = {
	text: string;
};
export declare type EnterpriseLogoCobranding = {
	lightLogoSrc: string;
	darkLogoSrc: string;
};
export declare type EnterpriseCallbackResponse = {
	continueWithOnfidoSubmission?: boolean;
	onfidoSuccess?: DocumentImageResponse | UploadFileResponse | FaceVideoResponse;
};
export declare type EnterpriseFeatures = {
	hideOnfidoLogo?: boolean;
	cobrand?: EnterpriseCobranding;
	logoCobrand?: EnterpriseLogoCobranding;
	useCustomizedApiRequests?: boolean;
	onSubmitDocument?: (data: FormData) => Promise<EnterpriseCallbackResponse>;
	onSubmitSelfie?: (data: FormData) => Promise<EnterpriseCallbackResponse>;
	onSubmitVideo?: (data: FormData) => Promise<EnterpriseCallbackResponse>;
};
export declare type DocumentResponse = {
	id: string;
	side: string;
	type: string;
};
export declare type FaceResponse = {
	id: string;
	variant: string;
};
export declare type SdkResponse = {
	document_front: DocumentResponse;
	document_back?: DocumentResponse;
	face: FaceResponse;
};
export declare type SdkError = {
	type: "exception" | "expired_token";
	message: string;
};
export declare type UserExitCode = "USER_CONSENT_DENIED";
export declare type ServerRegions = "US" | "EU" | "CA";
export interface FunctionalConfigurations {
	disableAnalytics?: boolean;
	mobileFlow?: boolean;
	roomId?: string;
	tearDown?: boolean;
	useMemoryHistory?: boolean;
}
export interface SdkOptions extends FunctionalConfigurations {
	onComplete?: (data: SdkResponse) => void;
	onError?: (error: SdkError) => void;
	onUserExit?: (data: UserExitCode) => void;
	onModalRequestClose?: () => void;
	token?: string;
	useModal?: boolean;
	isModalOpen?: boolean;
	shouldCloseOnOverlayClick?: boolean;
	containerId?: string;
	containerEl?: HTMLElement | null;
	language?: SupportedLanguages | LocaleConfig;
	region?: ServerRegions;
	smsNumberCountryCode?: string;
	userDetails?: {
		smsNumber?: string;
	};
	steps?: Array<StepTypes | StepConfig>;
	enterpriseFeatures?: EnterpriseFeatures;
	customUI?: UICustomizationOptions | null;
}
export declare type SdkHandle = {
	containerId?: string;
	options: SdkOptions;
	setOptions(options: SdkOptions): void;
	tearDown(): void;
};
export declare type SdkInitMethod = (options: SdkOptions) => SdkHandle;
export declare const init: SdkInitMethod;

export {};
