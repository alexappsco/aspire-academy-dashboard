'use server';

import { getData, editData, deleteData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type {
  ContactUsMessageDto,
  ContactUsMessageListResponse,
  GetContactUsMessagesParams,
  UpdateContactUsMessageStatusDto,
} from 'src/types/support';

export async function getContactUsMessages(
  params?: GetContactUsMessagesParams
): Promise<ApiSingleResponse<ContactUsMessageListResponse>> {
  try {
    let endpoint = endpoints.contactUsMessages.list;
    if (params) {
      const searchParams = new URLSearchParams();

      if (params.Filter && params.Filter.trim() !== '') {
        searchParams.append('Filter', params.Filter.trim());
      }

      if (params.Status && params.Status !== 'all') {
        searchParams.append('Status', params.Status);
      }

      if (params.SenderType && params.SenderType !== 'all') {
        searchParams.append('SenderType', params.SenderType);
      }

      if (params.Date) {
        searchParams.append('Date', params.Date);
      }

      if (params.Sorting) {
        searchParams.append('Sorting', params.Sorting);
      }

      if (typeof params.SkipCount === 'number') {
        searchParams.append('SkipCount', String(params.SkipCount));
      }

      if (typeof params.MaxResultCount === 'number') {
        searchParams.append('MaxResultCount', String(params.MaxResultCount));
      }

      const query = searchParams.toString();
      if (query) {
        endpoint += `?${query}`;
      }
    }

    const res = await getData<ContactUsMessageListResponse>(endpoint);

    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }

    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to fetch contact us messages';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contact us messages',
    };
  }
}

export async function getContactUsMessageById(
  id: string
): Promise<ApiSingleResponse<ContactUsMessageDto>> {
  try {
    const res = await getData<ContactUsMessageDto>(endpoints.contactUsMessages.details(id));
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to get contact us message details';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get contact us message details',
    };
  }
}

export async function updateContactUsMessageStatus(
  id: string,
  status: string | number | UpdateContactUsMessageStatusDto
): Promise<ApiSingleResponse<ContactUsMessageDto>> {
  try {
    const payload = typeof status === 'object' ? status : { status };
    const res = await editData<ContactUsMessageDto, UpdateContactUsMessageStatusDto>(
      endpoints.contactUsMessages.updateStatus(id),
      'PATCH',
      payload as UpdateContactUsMessageStatusDto
    );
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to update message status';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update message status',
    };
  }
}

export async function deleteContactUsMessage(id: string): Promise<ApiSingleResponse<void>> {
  try {
    const res = await deleteData<void>(endpoints.contactUsMessages.delete(id));
    if ('success' in res && res.success) {
      return { success: true };
    }
    const errorMsg =
      'error' in res ? (res as { error: string }).error : 'Failed to delete contact us message';
    return { success: false, error: errorMsg };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete contact us message',
    };
  }
}
