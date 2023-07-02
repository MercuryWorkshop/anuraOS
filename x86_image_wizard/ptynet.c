#include <curl/curl.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

const char b64chars[] =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
size_t b64_encoded_size(size_t inlen) {
  size_t ret;

  ret = inlen;
  if (inlen % 3 != 0)
    ret += 3 - (inlen % 3);
  ret /= 3;
  ret *= 4;

  return ret;
}
char *b64_encode(const unsigned char *in, size_t len) {
  char *out;
  size_t elen;
  size_t i;
  size_t j;
  size_t v;

  if (in == NULL || len == 0)
    return NULL;

  elen = b64_encoded_size(len);
  out = malloc(elen + 1);
  out[elen] = '\0';

  for (i = 0, j = 0; i < len; i += 3, j += 4) {
    v = in[i];
    v = i + 1 < len ? v << 8 | in[i + 1] : v << 8;
    v = i + 2 < len ? v << 8 | in[i + 2] : v << 8;

    out[j] = b64chars[(v >> 18) & 0x3F];
    out[j + 1] = b64chars[(v >> 12) & 0x3F];
    if (i + 1 < len) {
      out[j + 2] = b64chars[(v >> 6) & 0x3F];
    } else {
      out[j + 2] = '=';
    }
    if (i + 2 < len) {
      out[j + 3] = b64chars[v & 0x3F];
    } else {
      out[j + 3] = '=';
    }
  }

  return out;
}
size_t dataSize = 0;

size_t curlWriteFunction(void *ptr, size_t size /*always==1*/, size_t nmemb,
                         void *userdata) {
  char **stringToWrite = (char **)userdata;
  const char *input = (const char *)ptr;
  if (nmemb == 0)
    return 0;
  if (!*stringToWrite)
    *stringToWrite = malloc(nmemb + 1);
  else
    *stringToWrite = realloc(*stringToWrite, dataSize + nmemb + 1);
  memcpy(*stringToWrite + dataSize, input, nmemb);
  dataSize += nmemb;
  (*stringToWrite)[dataSize] = '\0';
  return nmemb;
}

char **headerdata;
unsigned long header_nitems = 0;

size_t header_callback(char *buffer, size_t size, size_t nitems) {
  // if (size < 3)
  //   return size * nitems;
  headerdata = realloc(headerdata, (header_nitems + 1) * sizeof(void *));

  // printf("%lu\n", headerdata);
  // printf("%lu\n", header_nitems);
  // printf("%lu, %lu, %lu\n", &headerdata[0], &headerdata[1], &headerdata[2]);
  // printf("%lu\n", *userdata);
  headerdata[header_nitems] = malloc(nitems + 1);
  strcpy(headerdata[header_nitems], buffer);

  header_nitems++;

  return size * nitems;
}

int main(void) {
  headerdata = malloc(0);
  CURL *curl;
  CURLcode res;

  char *data = 0;

  curl = curl_easy_init();
  if (!curl)
    return 1;

  while (1) {
    // url
    // headers
    // method
    // body
    size_t len = 0;
    ssize_t lineSize = 0;

    char *url = NULL;
    lineSize = getline(&url, &len, stdin);
    url[strcspn(url, "\n")] = 0;

    char *headers = NULL;
    lineSize = getline(&headers, &len, stdin);
    headers[strcspn(headers, "\n")] = 0;

    char *method = NULL;
    lineSize = getline(&method, &len, stdin);
    method[strcspn(method, "\n")] = 0;

    char *body = NULL;
    lineSize = getline(&body, &len, stdin);
    body[strcspn(body, "\n")] = 0;

    struct curl_slist *slist = NULL;

    slist = curl_slist_append(slist, "pragma:");

    curl_easy_setopt(curl, CURLOPT_URL, url);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 0L);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &data);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, &curlWriteFunction);
    curl_easy_setopt(curl, CURLOPT_HEADERDATA, &headerdata);
    curl_easy_setopt(curl, CURLOPT_HEADERFUNCTION, &header_callback);
    curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, method);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body);

    res = curl_easy_perform(curl);
    if (res != CURLE_OK)
      fprintf(stdout, "curl_easy_perform() failed: %s\n",
              curl_easy_strerror(res));

    printf("%lu\n", header_nitems);

    size_t output_length;
    for (int i = 0; i < header_nitems - 1; i++) {

      char *data = b64_encode(headerdata[i], strlen(headerdata[i]));
      printf("%s\n", data);

      // free(data);
      // free(headerdata[i]);
    }

    char *b64data = b64_encode(data, strlen(data));
    printf("|%s|", b64data);
    free(b64data);

    header_nitems = 0;

    free(url);
    free(headers);
    free(body);
    free(method);

    /* always cleanup */
  }
  curl_easy_cleanup(curl);
  return 0;
}
