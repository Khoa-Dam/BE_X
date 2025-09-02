export type FileDTO = {
    id: string;
    filename: string;
    url: string;
    mime?: string;
    size?: number;
    sha256?: string;
    provider: 'cloudinary';
    publicId: string;
    width?: number;
    height?: number;
    createdAt?: Date | string;
};

export function asFileDTO(input: any): FileDTO {
    const obj: any = (input && typeof input.toJSON === 'function') ? input.toJSON() : input;
    const id = String(obj?.id ?? obj?._id ?? '');
    const url = String(obj?.url ?? obj?.secureUrl ?? '');
    return {
        id,
        filename: String(obj?.filename ?? ''),
        url,
        mime: obj?.mime ?? undefined,
        size: obj?.size ?? undefined,
        sha256: obj?.sha256 ?? undefined,
        provider: 'cloudinary',
        publicId: String(obj?.publicId ?? ''),
        width: obj?.width ?? undefined,
        height: obj?.height ?? undefined,
        createdAt: obj?.createdAt ?? undefined
    };
}

export function asFileListDTO(rows: any[]): FileDTO[] {
    return (rows || []).map(asFileDTO);
}
